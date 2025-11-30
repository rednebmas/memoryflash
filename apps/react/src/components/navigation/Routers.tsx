import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { authSelector } from 'MemoryFlashCore/src/redux/selectors/authSelector';

interface RouteProps {
	screen: React.ReactNode;
}

export const AuthenticatedRoute: React.FC<RouteProps> = ({ screen }) => {
	const isAuthenticated = useAppSelector(authSelector);

	if (isAuthenticated === 'Authenticated') {
		return screen;
	} else if (isAuthenticated === 'PartiallyAuthenticated') {
		return <Navigate to="/auth/login" />;
	} else {
		return <Navigate to="/auth/login" />;
	}
};
