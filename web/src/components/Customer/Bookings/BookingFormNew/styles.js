import { makeStyles } from '@material-ui/styles';
import theme from '../../../../theme';

export const useStyles = makeStyles({
	componentGrid: {
		backgroundColor: '#fff',
		borderRadius: 8,
		alignItems: 'center',
		justifyItems: 'center',
		padding: 15,
		margin: 35,
		[theme.breakpoints.down('xs')]: {
			margin: 10,
		},
	},
	button: {
		marginTop: 45,
		marginBottom: 30,
	},
	buttonsContainer: {
		marginTop: 20,
	},
	slotButton: {
		'&:focus': {
			background: '#EF5350',
			color: '#fff',
		},
	},
	title: {
		marginBottom: 30,
	},
	errorText: {
		color: '#fff',
	},
	errorBox: {
		backgroundColor: '#ff867c',
		borderRadius: 8,
		marginTop: 20,
		marginBottom: 20,
		marginLeft: 10,
		marginRight: 10,
	},
	profileImgPicture: {
		border: '2px solid #555',
		height: 100,
		width: 100,
		fontSize: 30,
	},
	title: {
		marginTop: -50,
	},
	calendar: {},
});
