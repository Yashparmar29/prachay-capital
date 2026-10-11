const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Minimal valid PNG (with a blue/navy stroke signature placeholder)
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAFAAAAAyCAYAAAD6zkEEAAAAeUlEQVR42u3PMQ0AMAgEQcqH/TuuBCv42AQ0d2b2Oq8DPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uPA0uvH7lB5e/hS3vD93qAAAAAElFTkSuQmCC';
const buffer = Buffer.from(base64Png, 'base64');

fs.writeFileSync(path.join(uploadsDir, 'sample-director-signature.png'), buffer);
fs.writeFileSync(path.join(uploadsDir, 'sample-employee-signature.png'), buffer);
console.log('Sample signature images generated successfully in', uploadsDir);
