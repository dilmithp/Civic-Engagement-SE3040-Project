import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Issue from './src/models/Issue.model.js';
import User from './src/models/User.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Dummy user data
const usersData = [
    { name: 'Kamal Perera', email: 'kamal.perera@example.com', password: 'password123', role: 'user' },
    { name: 'Nimal Silva', email: 'nimal.silva@example.com', password: 'password123', role: 'user' },
    { name: 'Amaya Fernando', email: 'amaya.fernando@example.com', password: 'password123', role: 'user' },
    { name: 'Ruwan Jayawardena', email: 'ruwan.official@example.com', password: 'password123', role: 'official' },
    { name: 'Dilani Ratnayake', email: 'dilani.admin@example.com', password: 'password123', role: 'admin' }
];

async function seedDatabase() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        // Clear existing data
        const deletedIssues = await Issue.deleteMany({});
        const deletedUsers = await User.deleteMany({});
        console.log(`🗑️  Cleared ${deletedIssues.deletedCount} issues and ${deletedUsers.deletedCount} users.\n`);

        // Create dummy users
        const users = await User.insertMany(usersData);
        const [citizen1, citizen2, citizen3, official, admin] = users;

        console.log('👥 Created dummy users:');
        users.forEach((u) => console.log(`   ${u.role.padEnd(8)} → ${u.name} (${u.email}) | ID: ${u._id}`));
        console.log('');

        // Issues with real user references
        const dummyIssues = [
            {
                title: 'Large pothole on Main Street',
                description:
                    'There is a large pothole approximately 2 feet wide near the intersection of Main St and 5th Ave. Multiple vehicles have been damaged. This has been a problem for over two weeks and is getting worse with the rain.',
                category: 'Pothole',
                location: {
                    type: 'Point',
                    coordinates: [79.8612, 6.9271],
                    address: 'Main Street & 5th Avenue, Colombo 03'
                },
                reporter: citizen1._id,
                status: 'Pending',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen1._id, comment: 'Issue reported' }
                ],
                images: [],
                comments: []
            },
            {
                title: 'Broken streetlight near Central Park',
                description:
                    'The streetlight at the corner of Park Road has been broken for a week. The area becomes very dark at night, making it unsafe for pedestrians.',
                category: 'Broken Streetlight',
                location: {
                    type: 'Point',
                    coordinates: [79.8598, 6.9147],
                    address: 'Park Road, near Central Park entrance, Colombo 07'
                },
                reporter: citizen2._id,
                status: 'In Progress',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen2._id, comment: 'Issue reported' },
                    { status: 'In Progress', changedBy: official._id, comment: 'Maintenance crew dispatched.' }
                ],
                images: [],
                comments: [
                    { user: official._id, text: 'We have scheduled a maintenance visit for tomorrow morning.' }
                ]
            },
            {
                title: 'Illegal dumping behind Pettah Market',
                description:
                    'Someone has been illegally dumping construction waste and garbage behind the Pettah market area. The pile is growing and attracting stray animals.',
                category: 'Illegal Dumping',
                location: {
                    type: 'Point',
                    coordinates: [79.8514, 6.9355],
                    address: 'Behind Pettah Market, Colombo 11'
                },
                reporter: citizen3._id,
                status: 'Pending',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen3._id, comment: 'Issue reported' }
                ],
                images: [],
                comments: []
            },
            {
                title: 'Water leak on Galle Road',
                description:
                    'There is a significant water leak from a burst underground pipe on Galle Road. Water is flowing onto the road surface creating hazardous conditions.',
                category: 'Water Leak',
                location: {
                    type: 'Point',
                    coordinates: [79.8562, 6.8987],
                    address: 'Galle Road, near Colpetty Junction, Colombo 03'
                },
                reporter: citizen1._id,
                status: 'Resolved',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen1._id, comment: 'Issue reported' },
                    { status: 'In Progress', changedBy: official._id, comment: 'Water board notified.' },
                    { status: 'Resolved', changedBy: admin._id, comment: 'Pipe repaired. Issue resolved.' }
                ],
                images: [],
                comments: [
                    { user: official._id, text: 'National Water Supply Board has been notified.' },
                    { user: admin._id, text: 'Repair completed. Thank you for your patience.' }
                ]
            },
            {
                title: 'Damaged sidewalk on Duplication Road',
                description:
                    'Multiple slabs on the sidewalk are cracked and uneven, creating a tripping hazard for pedestrians.',
                category: 'Damaged Sidewalk',
                location: {
                    type: 'Point',
                    coordinates: [79.8565, 6.9025],
                    address: 'Duplication Road, Colombo 04'
                },
                reporter: citizen2._id,
                status: 'In Progress',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen2._id, comment: 'Issue reported' },
                    { status: 'In Progress', changedBy: official._id, comment: 'Contractor assigned.' }
                ],
                images: [],
                comments: []
            },
            {
                title: 'Graffiti on public library wall',
                description:
                    'The exterior wall of the Colombo Public Library has been vandalized with spray paint graffiti. Heritage building needs immediate cleaning.',
                category: 'Graffiti',
                location: {
                    type: 'Point',
                    coordinates: [79.8607, 6.9157],
                    address: 'Colombo Public Library, Colombo 07'
                },
                reporter: citizen3._id,
                status: 'Pending',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen3._id, comment: 'Issue reported' }
                ],
                images: [],
                comments: []
            },
            {
                title: 'Malfunctioning traffic signal at Bambalapitiya',
                description:
                    'The traffic signal at Bambalapitiya junction is stuck on red. Causing major traffic congestion during peak hours.',
                category: 'Traffic Signal',
                location: {
                    type: 'Point',
                    coordinates: [79.8561, 6.8939],
                    address: 'Bambalapitiya Junction, Colombo 04'
                },
                reporter: citizen1._id,
                status: 'In Progress',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen1._id, comment: 'Issue reported' },
                    { status: 'In Progress', changedBy: admin._id, comment: 'Traffic police notified.' }
                ],
                images: [],
                comments: [
                    { user: admin._id, text: 'A traffic officer has been stationed at the junction temporarily.' }
                ]
            },
            {
                title: 'Overflowing drain on Havelock Road',
                description:
                    'Storm drain is completely blocked and overflowing during rain. Sewage water spreading onto the road. Health hazard for residents.',
                category: 'Other',
                location: {
                    type: 'Point',
                    coordinates: [79.8634, 6.8842],
                    address: 'Havelock Road, Colombo 05'
                },
                reporter: citizen2._id,
                status: 'Pending',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen2._id, comment: 'Issue reported' }
                ],
                images: [],
                comments: []
            },
            {
                title: 'Withdrawn — Minor crack on side lane',
                description:
                    'Small crack on a side lane near Ward Place. After re-inspection, found to be minor. Withdrawn by reporter.',
                category: 'Pothole',
                location: {
                    type: 'Point',
                    coordinates: [79.8621, 6.9113],
                    address: 'Side lane off Ward Place, Colombo 07'
                },
                reporter: citizen3._id,
                status: 'Withdrawn',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen3._id, comment: 'Issue reported' },
                    { status: 'Withdrawn', changedBy: citizen3._id, comment: 'Issue withdrawn by reporter' }
                ],
                images: [],
                comments: []
            },
            {
                title: 'Multiple potholes on Marine Drive',
                description:
                    'At least 5 potholes along a 200-meter stretch of Marine Drive near port entrance. Heavy trucks worsening the situation. Urgent repair needed.',
                category: 'Pothole',
                location: {
                    type: 'Point',
                    coordinates: [79.8475, 6.9402],
                    address: 'Marine Drive, near Colombo South Port, Colombo 15'
                },
                reporter: citizen1._id,
                status: 'Pending',
                statusHistory: [
                    { status: 'Pending', changedBy: citizen1._id, comment: 'Issue reported' }
                ],
                images: [],
                comments: []
            }
        ];

        // Insert issues
        const inserted = await Issue.insertMany(dummyIssues);
        console.log(`✅ Seeded ${inserted.length} dummy issues:\n`);

        inserted.forEach((issue, i) => {
            console.log(`   ${i + 1}. [${issue.status.padEnd(11)}] ${issue.title}`);
        });

        console.log('\n📊 Summary:');
        console.log(`   Pending:     ${inserted.filter((i) => i.status === 'Pending').length}`);
        console.log(`   In Progress: ${inserted.filter((i) => i.status === 'In Progress').length}`);
        console.log(`   Resolved:    ${inserted.filter((i) => i.status === 'Resolved').length}`);
        console.log(`   Withdrawn:   ${inserted.filter((i) => i.status === 'Withdrawn').length}`);

        console.log('\n✅ Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

seedDatabase();
