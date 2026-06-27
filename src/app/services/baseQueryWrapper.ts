import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customBaseQuery = (entityPlural: string) => {
    const rawBaseQuery = fetchBaseQuery({
        baseUrl: "/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("accessToken");
            if (token && token !== "undefined") {
                headers.set("authorization", `Bearer ${token}`);
            }
            headers.set("ngrok-skip-browser-warning", "true");
            return headers;
        },
    });

    return async (args: any, api: any, extraOptions: any) => {
        const result = await rawBaseQuery(args, api, extraOptions);

        const method = typeof args === "string" ? "GET" : args.method || "GET";
        const url = typeof args === "string" ? args : args.url || "";

        console.log(`[customBaseQuery] ${method} ${url}`, { result, args });

        // If a GET request returns 404, check if it's a list request (not detail request ending with a 24-char hex ID)
        if (result.error && result.error.status === 404 && method.toUpperCase() === "GET") {
            const pathOnly = url.split("?")[0];
            const isDetailRequest = /\/[a-f\d]{24}$/i.test(pathOnly);
            console.log(`[customBaseQuery] 404 GET detected. isDetailRequest=${isDetailRequest}`);

            if (!isDetailRequest) {
                console.log(`[customBaseQuery] Intercepted 404 for ${entityPlural} list request. Returning empty list.`);
                // Return a mock successful response with empty array to clear the UI list
                return {
                    data: {
                        status: "success",
                        code: 200,
                        message: "No data found",
                        results: 0,
                        pagination: {
                            currentPage: 1,
                            limit: 10,
                            numberOfPages: 1,
                        },
                        data: {
                            [entityPlural]: [],
                        },
                    },
                };
            }
        }
        return result;
    };
};
