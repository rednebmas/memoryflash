import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../submodules/MemoryFlashCore/src/redux/store';
import { authSelector } from '../../submodules/MemoryFlashCore/src/redux/selectors/authSelector';

interface RouteProps {
	screen: React.ReactNode;
}

export const AuthenticatedRoute: React.FC<RouteProps> = ({ screen }) => {
	const isAuthenticated = useAppSelector(authSelector);

	if (isAuthenticated === 'Authenticated') {
		return screen;
	} else if (isAuthenticated === 'PartiallyAuthenticated') {
		return <Navigate to='/auth/login' />;
	} else {
		return <Navigate to='/auth/login' />;
	}
};

export const UnauthenticatedRoute: React.FC<RouteProps> = ({ screen }) => {
	const isAuthenticated = useAppSelector(authSelector);

	if (isAuthenticated === 'Authenticated') {
		return <Navigate to='/home' />;
	} else if (isAuthenticated === 'PartiallyAuthenticated') {
		return <Navigate to='/auth/login' />;
	} else {
		return screen;
	}
};

export const PartiallyAuthenticatedRoute: React.FC<RouteProps> = ({ screen }) => {
	const isAuthenticated = useAppSelector(authSelector);

	if (isAuthenticated === 'Authenticated') {
		return <Navigate to='/home' />;
	} else if (isAuthenticated === 'PartiallyAuthenticated') {
		return screen;
	} else {
		return <Navigate to='/' />;
	}
};
