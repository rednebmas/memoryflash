import { decksActions } from '../slices/decksSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { CardTypeBase, CardTypeEnum } from '../../types/Cards';

interface CreateDeckParams {
  courseId: string;
  name: string;
  section?: string;
  sectionSubtitle?: string;
  cards?: CardTypeBase<CardTypeEnum, any>[];
}

export const createDeck = 
  ({ courseId, name, section, sectionSubtitle, cards }: CreateDeckParams): AppThunk =>
  async (dispatch, _, { api }) => {
    return await networkCallWithReduxState(dispatch, 'createDeck', async () => {
      const res = await api.post('/decks', { 
        courseId, 
        name, 
        section, 
        sectionSubtitle,
        cards
      });
      
      dispatch(decksActions.upsert([res.data.deck]));
      
      return res.data.deck;
    });
  };