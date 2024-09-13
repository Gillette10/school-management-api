import axios from 'axios';

export const SendChangePasswordNotification = async (
	name: string,
	email: string,
	url: string,
) => {
	try {
		const response = await axios.post(
			`https://prod-29.northcentralus.logic.azure.com:443/workflows/814de362115d42b2ba17ed4c55a15858/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=fzune8s9Sx3az9JzyCj2-QYGWD2R2wmiAFjiY4dmm0Q`,
			{
				name,
				email,
				url,
			},
		);

		console.log('Notification sent:', response.data);
	} catch (error) {
		console.error('Error sending notification:', error);
	}
};
