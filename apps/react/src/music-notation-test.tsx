import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MusicNotation } from './components/MusicNotation';
import { createStore } from 'MemoryFlashCore/src/redux/store';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

const store = createStore({ scheduler: { multiPartCardIndex: 0 } } as any, () => {});

const data: MultiSheetQuestion = {
  key: 'C',
  voices: [
    {
      staff: StaffEnum.Treble,
      stack: [
        { notes: [{ name: 'C', octave: 4 }], duration: 'q', chordName: 'C' },
        { notes: [{ name: 'D', octave: 4 }], duration: 'q' },
        { notes: [{ name: 'E', octave: 4 }], duration: 'q' },
        { notes: [{ name: 'F', octave: 4 }], duration: 'q' },
      ],
    },
  ],
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <MusicNotation data={data} />
    </Provider>
  </React.StrictMode>,
);
