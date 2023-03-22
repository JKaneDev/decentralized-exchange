import { connect } from 'react-redux';

const Balance = () => {
	return (
		<div className='card bg-dark text-white'>
			<div className='card-header'>Balance</div>
			<div className='card-body'></div>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		// TODO
	};
}

export default connect(mapStateToProps)(Balance);
