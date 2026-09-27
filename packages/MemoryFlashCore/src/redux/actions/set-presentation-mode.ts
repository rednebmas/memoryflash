import { PresentationModeIds } from '../../types/PresentationMode';
import { settingsActions } from '../slices/settingsSlice';
import { saveSetting } from './save-setting-action';

export const setPresentationMode = (cardType: string, mode: PresentationModeIds) =>
	saveSetting(settingsActions.setPresentationMode({ cardType, mode }));
