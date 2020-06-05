import { 
	USER_LOAD_REQ, USER_LOAD_SUCCESS, USER_LOAD_ERROR,
	USER_UPDATE_SUCCESS,
	USER_NOT_AUTHORIZED,
	USER_REFRESH_REQ,
	USER_LOGIN_PASSWORD,
	USER_REGISTER_PASSWORD,
	USER_LOST_PASSWORD, USER_LOST_PASSWORD_SUCCESS,
	USER_RECOVER_PASSWORD,
	USER_LOGIN_NATIVE,
	USER_SUBSCRIPTION_LOAD_REQ, USER_SUBSCRIPTION_LOAD_SUCCESS, USER_SUBSCRIPTION_LOAD_ERROR
} from '../constants/user'
import { REHYDRATE } from 'redux-persist/src/constants'
import { COLLECTIONS_LOAD_SUCCESS } from '../constants/collections'

import Immutable from 'seamless-immutable'
import { 
	normalizeUser,
	blankCurrent,
	blankSubscription
} from '../helpers/user'

export default function(state = initialState, action){switch (action.type) {
	case REHYDRATE:{
		const { current, status=initialState.status } = action.payload && action.payload.user||{}

		if (!current)
			return state
			
		return state
			.set('fromCache', true)
			.set('current', current)
			.set(['status', 'authorized'], status.authorized)
	}

	//Load
	case USER_LOAD_REQ:{
		if (state.status.authorized!='yes' && !state.fromCache){
			action.ignore = true
			return state;
		}
		
		return setSpecificStatus(state)
	}

	//Refresh
	case USER_REFRESH_REQ:{
		return setSpecificStatus(state, action.way, 'loading')
	}

	//Login
	case USER_LOGIN_PASSWORD:{
		return setSpecificStatus(state, 'login', 'loading')
	}

	//Register
	case USER_REGISTER_PASSWORD:{
		return setSpecificStatus(state, 'register', 'loading')
	}

	//Native
	case USER_LOGIN_NATIVE:{
		return setSpecificStatus(state, 'native', 'loading')
	}

	//Lost
	case USER_LOST_PASSWORD:{
		return setSpecificStatus(state, 'lost', 'loading')
	}

	case USER_LOST_PASSWORD_SUCCESS:{
		return setSpecificStatus(state, 'lost', 'success')
	}

	//Recover
	case USER_RECOVER_PASSWORD:{
		return setSpecificStatus(state, 'recover', 'loading')
	}

	case USER_LOAD_SUCCESS:
	case USER_UPDATE_SUCCESS:
	case COLLECTIONS_LOAD_SUCCESS:{
		if (typeof action.onSuccess == 'function')
			action.onSuccess()

		return initialState
			.set('status', initialState.status.set('authorized', 'yes'))
			.set('current', normalizeUser(action.user))
	}

	case USER_LOAD_ERROR:{
		if (typeof action.onFail == 'function')
			action.onFail(action.error)

		state = initialState

		if (action.way)
			state = state.setIn(['errorReason', action.way], action.error)

		return setSpecificStatus(state, action.way, 'error')
	}

	//happen on logout too
	case USER_NOT_AUTHORIZED:{
		return initialState
			.set('status', initialState.status.set('authorized', 'no'))
	}

	case USER_SUBSCRIPTION_LOAD_REQ:{
		return state
			.setIn(['subscription', 'loading'], true)
	}

	case USER_SUBSCRIPTION_LOAD_SUCCESS:{
		return state
			.set('subscription', action.subscription)
	}

	case USER_SUBSCRIPTION_LOAD_ERROR:{
		return state
			.set('subscription', blankSubscription)
	}

	default:{
		return state;
	}
}}

const setSpecificStatus = (state, way='', val='idle')=>{
	return state
		.setIn(['status', 'login'], 	way == 'login' ? val : 'idle')
		.setIn(['status', 'register'], 	way == 'register' ? val : 'idle')
		.setIn(['status', 'native'], 	way == 'native' ? val : 'idle')
		.setIn(['status', 'lost'],		way == 'lost' ? val : 'idle')
		.setIn(['status', 'recover'], 	way == 'recover' ? val : 'idle')
}

const initialState = Immutable({
	fromCache: false,
	status: {
		authorized:	'idle', //idle, yes, no
		login:		'idle', //idle, loading, error
		register:	'idle',
		native:		'idle',
		lost:		'idle', //idle, loading, error, success
		recover:	'idle'
	},
	errorReason: {
		login:'',
		register:'',
		native:''
	},
	current: blankCurrent,
	subscription: blankSubscription
})