/** Bound network waits without changing the portal's existing API error contract. */
const inFlight = new Map<string, Promise<Response>>();
const TIMEOUT_MS = 15_000;

async function request(
	input: string,
	init: RequestInit = {},
): Promise<Response> {
	const controller = new AbortController();
	const abort = () => controller.abort(init.signal?.reason);
	if (init.signal?.aborted) abort();
	else init.signal?.addEventListener("abort", abort, { once: true });
	const timeout = setTimeout(
		() => controller.abort(new Error("request_timeout")),
		TIMEOUT_MS,
	);
	try {
		return await globalThis.fetch(input, {
			cache: "no-store",
			...init,
			signal: controller.signal,
		});
	} finally {
		clearTimeout(timeout);
		init.signal?.removeEventListener("abort", abort);
	}
}

export async function apiFetch(
	input: string,
	init?: RequestInit,
): Promise<Response> {
	// Deduplicate identical plain reads only; writes and custom requests must remain independent.
	if (init) return request(input, init);
	let pending = inFlight.get(input);
	if (!pending) {
		pending = request(input);
		inFlight.set(input, pending);
	}
	try {
		return (await pending).clone();
	} finally {
		if (inFlight.get(input) === pending) inFlight.delete(input);
	}
}
