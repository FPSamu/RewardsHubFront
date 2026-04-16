import api from './api';

const passService = {
    /**
     * Downloads the Apple Wallet .pkpass file for the authenticated user.
     * On iOS Safari, opening a pkpass blob URL automatically shows the
     * "Add to Wallet" dialog.
     */
    async downloadApplePass() {
        const response = await api.get('/passes/apple', { responseType: 'arraybuffer' });
        const blob = new Blob([response.data], { type: 'application/vnd.apple.pkpass' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rewardshub.pkpass';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Fetches the Google Wallet save URL and opens it in a new tab.
     */
    async openGooglePass() {
        const { data } = await api.get('/passes/google');
        window.open(data.url, '_blank', 'noopener,noreferrer');
    },
};

export default passService;
