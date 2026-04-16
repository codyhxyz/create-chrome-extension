/**
 * Typed extension messaging built on @webext-core/messaging.
 *
 * Use sendMessage() from content scripts or popup to talk to the background,
 * and onMessage() in the background to handle incoming requests.
 *
 * Add new message types to ProtocolMap — the compiler enforces that every
 * sendMessage call has the correct data shape and every handler returns
 * the expected response type.
 */

import { defineExtensionMessaging, ProtocolWithReturn } from '@webext-core/messaging';

/**
 * Define your extension's message protocol here.
 * Each key is a message name. Use ProtocolWithReturn<Data, Response> for messages
 * that return a value, or just the data type for fire-and-forget messages.
 *
 * @example
 *   interface ProtocolMap {
 *     getSettings: ProtocolWithReturn<void, Settings>;
 *     saveItem: ProtocolWithReturn<{ id: string; value: string }, boolean>;
 *     notify: string; // fire-and-forget, data is a string, no return
 *   }
 */
interface ProtocolMap {
  ping: ProtocolWithReturn<void, string>;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
