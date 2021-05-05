const knex = require('../database/knex');
const { Consumer } = require('sqs-consumer');

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

module.exports = {
	async indexUser(req, res, next) {
		try {
			const { userId } = req.params;

			if (!userId) return res.status(400).json({ message: 'Missing User ID' });

			const connectDB = await knex.connect();

			const allBookings = await connectDB('bookings')
				.select(
					'bookings.*',
					'users.first_name',
					'users.last_name',
					'users.profile_img_url',
					'users.county',
					'users.country',
					'slots.start_time',
					'slots.end_time',
				)
				.leftJoin('users', 'users.id', 'bookings.hairdresser_id')
				.leftJoin('slots', 'slots.id', 'bookings.slot_id')
				.where({
					user_id: userId,
				});

			if (!allBookings)
				return res
					.status(400)
					.json({ message: 'No Bookings Found for this user' });

			return res.status(200).json({ bookings: allBookings });
		} catch (error) {
			next(error);
		}
	},

	async indexHairdresser(req, res, next) {
		try {
			const { hairdresserId } = req.params;

			if (!hairdresserId)
				return res.status(400).json({ message: 'Missing Hairdresser ID' });

			const connectDB = await knex.connect();

			const allBookings = await connectDB('bookings').where({
				hairdresser_id: hairdresserId,
			});

			if (!allBookings)
				return res
					.status(400)
					.json({ message: 'No Bookings Found for this hairdresser' });

			return res.status(200).json({ bookings: allBookings });
		} catch (error) {
			next(error);
		}
	},

	async view(req, res, next) {
		try {
			const connectDB = await knex.connect();

			const { id } = req.params;

			if (!id) {
				return res.status(400).json({ message: 'Missing Booking ID' });
			}

			const bookingFromDB = await connectDB('bookings')
				.where({ id: id })
				.first();

			if (!bookingFromDB)
				return res.status(400).json({ message: 'No Booking Found' });

			return res.status(200).json({ booking: bookingFromDB });
		} catch (error) {
			next(error);
		}
	},

	async create(req, res, next) {
		try {
			const { userId, hairdresserId, slotId, date } = req.body;

			if (!userId || !hairdresserId || !slotId || !date) {
				return res
					.status(400)
					.json({ message: 'Missing Required Information from Request' });
			}

			const connectDB = await knex.connect();

			const newBooking = await connectDB('bookings').insert({
				user_id: userId,
				hairdresser_id: hairdresserId,
				slot_id: slotId,
				date: date,
			});

			/*
      const SQSParams = {
        MessageAttributes: {
          "bookingID": {
            DataType: "String",
            StringValue: String(newBooking[0])
          },
          "userId": {
            DataType: "String",
            StringValue: String(userId)
          },
          "hairdresserId": {
            DataType: "String",
            StringValue: String(hairdresserId)
          },
          "userEmail": {
            DataType: "String",
            StringValue: userEmail
          },
          "date": {
            DataType: "String",
            StringValue: date
          },
          "startTime": {
            DataType: "String",
            StringValue: startTime
          },
          "duration": {
            DataType: "String",
            StringValue: String(duration)
          },
        },
        MessageBody: "New Booking Confirmation Email",
        MessageDeduplicationId: String(newBooking[0]),  // Required for FIFO queues
        MessageGroupId: "Group1",  // Required for FIFO queues
        QueueUrl: "https://sqs.eu-west-1.amazonaws.com/128363080680/RESTaurant-BookingConfirmationEmail.fifo"
      }

      sqs.sendMessage(SQSParams, function(err, data){
        if (err) {
          console.log("Error", err);
          return res.status(500).json({ err });
        } else {
          console.log("Success", data.MessageId);
        }
      })
      */

			return res.status(201).json({
				message: 'Booking Registered Successfully',
				booking: newBooking,
			});
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const connectDB = await knex.connect();

			const { id, userId, hairdresserId, slotId, date, reviewId } = req.body;

			if (!id || !userId || !hairdresserId || !slotId || !date) {
				return res
					.status(400)
					.json({ message: 'Missing Required Information from Request' });
			}

			const bookingFromDB = await connectDB('bookings')
				.where({ id: id })
				.first();

			if (!bookingFromDB)
				return res.status(400).json({ message: 'No Booking Found' });

			const updatedBooking = await connectDB('bookings')
				.where({ id: id })
				.update({
					user_id: userId,
					hairdresser_id: hairdresserId,
					slot_id: slotId,
					date: date,
					review_id: reviewId,
				});

			return res.status(200).json({ message: 'Booking updated successfully' });
		} catch (error) {
			next(error);
		}
	},

	async delete(req, res, next) {
		try {
			const connectDB = await knex.connect();

			const { id } = req.body;

			if (!id) {
				return res
					.status(400)
					.json({ message: 'Missing Required Information from Request' });
			}

			const bookingFromDB = await connectDB('bookings')
				.where({ id: id })
				.first();

			if (!bookingFromDB)
				return res.status(400).json({ message: 'No Booking Found' });

			const deletedBooking = await connectDB('bookings')
				.where({ id: id })
				.del();

			return res.status(200).json({ message: 'Booking deleted successfully' });
		} catch (error) {
			next(error);
		}
	},

	async checkSlotsAvailability(req, res, next) {
		try {
			const { hairdresserId, date } = req.query;

			if (!hairdresserId || !date) {
				return res
					.status(400)
					.json({ message: 'Missing Required Information from Request' });
			}

			var convertedDate = new Date(date);
			var weekday = new Array(7);
			weekday[0] = 'Sunday';
			weekday[1] = 'Monday';
			weekday[2] = 'Tuesday';
			weekday[3] = 'Wednesday';
			weekday[4] = 'Thursday';
			weekday[5] = 'Friday';
			weekday[6] = 'Saturday';
			var dateWeekDay = weekday[convertedDate.getDay()];

			const connectDB = await knex.connect();

			//Get all slots that are registered for that week day
			const allRegisteredSlotsWeekDayTrueRaw = await connectDB.schema.raw(
				`SELECT id, start_time, end_time from slots WHERE ${dateWeekDay} = true AND hairdresser_id = ${hairdresserId}`,
			);

			var allRegisteredSlotsWeekDayTrueClean = [];
			for (const slot of allRegisteredSlotsWeekDayTrueRaw[0]) {
				allRegisteredSlotsWeekDayTrueClean.push({
					id: slot.id,
					start_time: slot.start_time,
					end_time: slot.end_time,
				});
			}

			//Get all bookings for the same date
			const existingBookingsOnDate = await connectDB('bookings').where({
				date: date,
				hairdresser_id: hairdresserId,
			});

			var availableSlots = [];
			for (const slot of allRegisteredSlotsWeekDayTrueClean) {
				slotAlreadyBooked = false;

				for (const booking of existingBookingsOnDate) {
					if (slot.id == booking.slot_id) {
						slotAlreadyBooked = true;
					}
				}

				//Adds the current slot in the loop if it's not already booked
				if (!slotAlreadyBooked) {
					availableSlots.push({
						id: slot.id,
						start_time: slot.start_time,
						end_time: slot.end_time,
					});
				}
			}

			return res.status(200).json({ availableSlots });
		} catch (error) {
			next(error);
		}
	},

	async createFromQueue(message) {
		try {
			const sqsMessage = JSON.parse(message.Body);

			const { userId, hairdresserId, slotId, date } = sqsMessage;

			if (!userId || !hairdresserId || !slotId || !date) {
				return console.log('Missing Required Information from Request');
			}

			const connectDB = await knex.connect();

			const newBooking = await connectDB('bookings').insert({
				user_id: userId,
				hairdresser_id: hairdresserId,
				slot_id: slotId,
				date: date,
			});

			const SQSParams = {
				MessageAttributes: {
					bookingID: {
						DataType: 'String',
						StringValue: String(newBooking[0]),
					},
					userId: {
						DataType: 'String',
						StringValue: String(userId),
					},
					hairdresserId: {
						DataType: 'String',
						StringValue: String(hairdresserId),
					},
					userEmail: {
						DataType: 'String',
						StringValue: userEmail,
					},
					date: {
						DataType: 'String',
						StringValue: date,
					},
					startTime: {
						DataType: 'String',
						StringValue: startTime,
					},
					duration: {
						DataType: 'String',
						StringValue: String(duration),
					},
				},
				MessageBody: 'New Booking Confirmation Email',
				MessageDeduplicationId: String(newBooking[0]), // Required for FIFO queues
				MessageGroupId: 'Group1', // Required for FIFO queues
				QueueUrl:
					'https://sqs.eu-west-1.amazonaws.com/128363080680/RESTaurant-BookingConfirmationEmail.fifo',
			};

			sqs.sendMessage(SQSParams, function (err, data) {
				if (err) {
					console.log('Error', err);
					return res.status(500).json({ err });
				} else {
					console.log('Success', data.MessageId);
				}
			});

			return console.log('Booking Fully Processed Successfully');
		} catch (error) {
			console.log(error);
		}
	},
};
