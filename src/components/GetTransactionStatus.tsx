import axios from "axios";

export const getTransactionStatus = async (txId: string) => {

    const url = "http://8.52.151.4:9801";

    const data = {
        jsonrpc: "2.0",
        method: "rpc-xtransaction",
        params: [txId],
        id: 1
    };

    try {

        const response = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            return { ok: true, data: response.data };
        } else {
            throw new Error(`Error: ${response.status}`);
        }

    } catch (error) {
        console.error("Error fetching transaction status:", error);
        throw error;
    }
}