export const verifyCode = async (code: string) => {
    try {
        const response = await fetch(`/api/verify?code=${code}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return { ok: false, message: 'Invalid discount code!' };

        }

        const data = await response.json();
        console.log("verify status >>> ", data);
        return { ok: true, data: data?.data };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { ok: false };
    }
};

export const markCodeUsed = async (code: string, wallet: string) => {
    try {
        const response = await fetch(`
            /api/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, wallet }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return { ok: true, data: data?.data };

    } catch (error) {
        console.error('Error fetching data:', error);
        return { ok: false };

    }
}