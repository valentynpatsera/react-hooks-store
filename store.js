import { useState, useEffect } from 'react';

const sliceNameSymb = Symbol('slice-name');

const globalState = {};
const actionNameToSliceName = {};
const sliceReducers = {};
const sliceListeners = {};

export const useDispatch = () => action => {
  const { type, payload } = action;
  const sliceName = actionNameToSliceName[type];
  const sliceState = globalState[sliceName];
  const reducer = sliceReducers[type];

  if (reducer) {
    globalState[sliceName] = reducer(sliceState, payload);
    const listeners = sliceListeners[sliceName];
    for (const listener of listeners) {
      listener(sliceState);
    }
  } else {
    console.warn(`There is no action with name ${type}`);
  }
};

export const useSelector = selectorCallback => {
  const setState = useState(globalState)[1];
  const stateSlice = selectorCallback(globalState);
  const sliceName = stateSlice[sliceNameSymb];
  useEffect(() => {
    sliceListeners[sliceName].push(setState);
    return () => {
      sliceListeners[sliceName] = sliceListeners[sliceName].filter(
        li => li !== setState
      );
    };
  }, [setState, sliceName]);

  return stateSlice;
};

export const initStore = (reducer, initialState) => {
  for (const [sliceName, sliceValue] of Object.entries(initialState)) {
    globalState[sliceName] = sliceValue;
    globalState[sliceName][sliceNameSymb] = sliceName;
    sliceListeners[sliceName] = [];
    for (const [reducerName, stateUpdater] of Object.entries(reducer)) {
      sliceReducers[reducerName] = stateUpdater;
      actionNameToSliceName[reducerName] = sliceName;
    }
  }
};
