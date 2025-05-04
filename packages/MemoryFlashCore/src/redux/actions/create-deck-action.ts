import { decksActions } from '../slices/decksSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

interface CreateDeckParams {
  courseId: string;
  name: string;
  section?: string;
  sectionSubtitle?: string;
}

export const createDeck = 
  ({ courseId, name, section, sectionSubtitle }: CreateDeckParams): AppThunk =>
  async (dispatch, _, { api }) => {
    return await networkCallWithReduxState(dispatch, 'createDeck', async () => {
      const res = await api.post('/decks', { 
        courseId, 
        name, 
        section, 
        sectionSubtitle 
      });
      
      dispatch(decksActions.upsert([res.data.deck]));
      
      return res.data.deck;
    });
  };