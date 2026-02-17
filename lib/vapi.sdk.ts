import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export const getVapi = () => {
	const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
	if (!token) {
		throw new Error("Vapi web token is missing. Set NEXT_PUBLIC_VAPI_WEB_TOKEN.");
	}

	if (!vapiInstance) {
		vapiInstance = new Vapi(token);
	}

	return vapiInstance;
};
