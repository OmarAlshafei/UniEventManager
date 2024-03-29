const express = require('express')
const bodyParser        = require('body-parser');
const cors              = require('cors');
const PORT = process.env.PORT || 5000;
const app = express()

// Port Configurations
app.set('port', (process.env.PORT || 5000))
app.use(cors());
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/bugit ild'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
});