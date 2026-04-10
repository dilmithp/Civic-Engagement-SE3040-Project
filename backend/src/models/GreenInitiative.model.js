import mongoose from 'mongoose';

const greenInitiativeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide an initiative title'],
            trim: true,
            maxLength: [100, 'Title cannot be more than 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            maxLength: [1000, 'Description cannot be more than 1000 characters']
        },
        location: {
            type: String,
            required: [true, 'Please provide a location']
        },
        date: {
            type: Date,
            required: [true, 'Please provide a date for the initiative']
        },
        status: {
            type: String,
            enum: ['Upcoming', 'Ongoing', 'Completed', 'Upcoming (Weather Alert)'],
            default: 'Upcoming'
        },
        // Changed from ObjectId to Number to match your friend's SQL database
        isOfficial: {
            type: Boolean,
            default: false
        },
        organizer: {
            type: Number,
            required: true
        },
        participants: [
            {
                type: String
            }
        ],
        // Store the weather forecast snapshot for the event day
        weatherForecast: {
            temp: {
                type: Number,
                required: false
            },
            condition: {
                type: String,
                required: false // e.g., "Rain", "Clear", "Clouds"
            },
            description: {
                type: String,
                required: false // e.g., "light rain", "few clouds"
            }
        }
    },
    {
        timestamps: true
    }

);

const GreenInitiative = mongoose.model('GreenInitiative', greenInitiativeSchema);
export default GreenInitiative;