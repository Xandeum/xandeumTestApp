
export const updatePurchases = async (qty: number, wallet: string) => {
    try {
        const response = await fetch(`
            /api/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wallet, qty }),
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