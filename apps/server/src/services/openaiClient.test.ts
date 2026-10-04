import { expect } from 'chai';
import { buildUserContent } from './openaiClient';

describe('openaiClient', () => {
	it('sends plain text when no image is attached', () => {
		expect(buildUserContent('hi')).to.equal('hi');
	});

	it('sends text and image parts when an image is attached', () => {
		const image = 'data:image/jpeg;base64,abc';
		expect(buildUserContent('hi', image)).to.deep.equal([
			{ type: 'input_text', text: 'hi' },
			{ type: 'input_image', image_url: image, detail: 'high' },
		]);
	});
});
