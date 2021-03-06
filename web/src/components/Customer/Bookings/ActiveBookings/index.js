import React from 'react';
import { Grid, Typography, List, Divider } from '@material-ui/core';

import { useStyles } from './styles.js';

import BookingCardActive from '../BookingCardActive';

export default function ActiveBookings(props) {
	const classes = useStyles();

	return (
		<Grid container className={classes.componentGrid}>
			<Grid item xs={12} className={classes.title}>
				<Typography variant='h4'>Active Bookings</Typography>
			</Grid>

			{props.bookings.length > 0 ? (
				<Grid item xs={12}>
					<List className={classes.list} dense>
						{props.bookings.map((booking, i) => (
							<Grid item xs={12}>
								<BookingCardActive
									booking={booking}
									userId={props.userId}
									isHairdresser={props.isHairdresser}
								/>

								{i + 1 < props.bookings.length && <Divider />}
							</Grid>
						))}
					</List>
				</Grid>
			) : (
				<Grid item>
					<Typography>You don't have any active bookings.</Typography>
				</Grid>
			)}
		</Grid>
	);
}
