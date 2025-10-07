import { createEvent } from 'effector';
import type { UpdateNodePayload, AddChildPayload } from './types';

// Операции с кэшем
export const applyCache = createEvent();
export const addChildToCache = createEvent<AddChildPayload>();
export const updateCacheNode = createEvent<UpdateNodePayload>();
export const removeFromCache = createEvent<string>();
export const resetCacheData = createEvent();
