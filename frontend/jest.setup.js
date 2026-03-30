/* global global */
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

if (!global.TextEncoder) {
	global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
	global.TextDecoder = TextDecoder;
}

// Mock IntersectionObserver for framer-motion's whileInView
if (!global.IntersectionObserver) {
	global.IntersectionObserver = class IntersectionObserver {
		constructor() {}
		disconnect() {}
		observe() {}
		takeRecords() {
			return [];
		}
		unobserve() {}
	};
}
