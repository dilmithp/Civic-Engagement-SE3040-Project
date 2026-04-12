/**
 * UNIT TESTS — Issue Service
 * Tests all IssueService methods in isolation using Jest mocks.
 * No real DB, no real Cloudinary, no real Geocoding.
 */

// ── Mock all dependencies BEFORE importing the service ─────────────────────
jest.mock('../../src/models/Issue.model.js', () => {
    const mockIssue = {
        findById: jest.fn(),
        create: jest.fn(),
        findByIdAndDelete: jest.fn(),
        paginate: jest.fn(),
    };
    return { __esModule: true, default: mockIssue };
});

jest.mock('../../src/services/cloudinary.service.js', () => ({
    __esModule: true,
    default: {
        extractUploadedImages: jest.fn(() => []),
        deleteImages: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('../../src/services/geocoding.service.js', () => ({
    __esModule: true,
    default: {
        reverseGeocode: jest.fn(() => Promise.resolve({ displayName: 'Test Street, Colombo' })),
    },
}));

// ── Import after mocks ──────────────────────────────────────────────────────
import IssueService from '../../src/services/issue.service.js';
import Issue from '../../src/models/Issue.model.js';
import CloudinaryService from '../../src/services/cloudinary.service.js';
import AppError from '../../src/utils/AppError.js';
import {
    ISSUE_STATUS,
    ALLOWED_TRANSITIONS,
    ISSUE_CATEGORIES,
} from '../../src/config/constants.js';

// ── Helpers ─────────────────────────────────────────────────────────────────
const MOCK_USER_ID = 'user-abc-123';
const MOCK_ADMIN_ID = 'admin-xyz-456';
const MOCK_ISSUE_ID = '66f1a2b3c4d5e6f7a8b9c0d1';

/** Create a fake Mongoose issue document (with save() spy) */
function createMockIssue(overrides = {}) {
    return {
        _id: MOCK_ISSUE_ID,
        title: 'Test Pothole',
        description: 'There is a large pothole on Main St.',
        category: 'Pothole',
        status: ISSUE_STATUS.PENDING,
        reporter: MOCK_USER_ID,
        location: { type: 'Point', coordinates: [80.2707, 6.9271], address: 'Colombo' },
        images: [],
        statusHistory: [{ status: ISSUE_STATUS.PENDING, changedBy: MOCK_USER_ID, comment: 'Issue reported' }],
        comments: [],
        save: jest.fn().mockResolvedValue(true),
        toString: () => MOCK_USER_ID,
        ...overrides,
    };
}

// ════════════════════════════════════════════════════════════════════════════
describe('IssueService — Unit Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── 1. createIssue ─────────────────────────────────────────────────────
    describe('createIssue()', () => {

        it('TC-U-01 | should create an issue and return the new document', async () => {
            const mockCreated = createMockIssue();
            Issue.create.mockResolvedValue(mockCreated);
            CloudinaryService.extractUploadedImages.mockReturnValue([]);

            const issueData = {
                title: 'Test Pothole',
                description: 'Large pothole on Main St.',
                category: 'Pothole',
                latitude: '6.9271',
                longitude: '80.2707',
                address: 'Colombo',
            };

            const result = await IssueService.createIssue(issueData, MOCK_USER_ID, []);

            expect(Issue.create).toHaveBeenCalledTimes(1);
            expect(result.title).toBe('Test Pothole');
            expect(result.reporter).toBe(MOCK_USER_ID);
        });

        it('TC-U-02 | should auto-geocode address when not provided', async () => {
            const mockCreated = createMockIssue();
            Issue.create.mockResolvedValue(mockCreated);

            const issueData = {
                title: 'Auto-geocode Issue',
                description: 'Testing geocode fallback.',
                category: 'Water Leak',
                latitude: '6.9271',
                longitude: '80.2707',
                // address NOT provided
            };

            await IssueService.createIssue(issueData, MOCK_USER_ID, []);

            const callArg = Issue.create.mock.calls[0][0];
            expect(callArg.location.address).toBe('Test Street, Colombo');
        });

        it('TC-U-03 | should still create issue if reverse geocoding fails', async () => {
            const { default: GeocodingService } = await import('../../src/services/geocoding.service.js');
            GeocodingService.reverseGeocode.mockRejectedValueOnce(new Error('Geocode API down'));

            const mockCreated = createMockIssue();
            Issue.create.mockResolvedValue(mockCreated);

            const issueData = {
                title: 'Geocode Failure Issue',
                description: 'Geocoding will fail.',
                category: 'Pothole',
                latitude: '6.9271',
                longitude: '80.2707',
            };

            const result = await IssueService.createIssue(issueData, MOCK_USER_ID, []);

            // Should still resolve without throwing
            expect(result).toBeDefined();
            expect(Issue.create).toHaveBeenCalled();
        });

        it('TC-U-04 | should extract and attach uploaded images', async () => {
            const fakeImages = [
                { url: 'https://cdn.test/img1.jpg', publicId: 'civic/img1' },
                { url: 'https://cdn.test/img2.jpg', publicId: 'civic/img2' },
            ];
            CloudinaryService.extractUploadedImages.mockReturnValue(fakeImages);
            Issue.create.mockResolvedValue(createMockIssue({ images: fakeImages }));

            const issueData = {
                title: 'Issue with Images',
                description: 'Has images.',
                category: 'Graffiti',
                latitude: '6.9271',
                longitude: '80.2707',
                address: 'Colombo',
            };

            await IssueService.createIssue(issueData, MOCK_USER_ID, [{ filename: 'img1.jpg' }]);
            expect(CloudinaryService.extractUploadedImages).toHaveBeenCalled();
        });
    });

    // ── 2. getIssueById ────────────────────────────────────────────────────
    describe('getIssueById()', () => {

        it('TC-U-05 | should return the issue when found', async () => {
            const mockIssue = createMockIssue();
            Issue.findById.mockResolvedValue(mockIssue);

            const result = await IssueService.getIssueById(MOCK_ISSUE_ID);

            expect(Issue.findById).toHaveBeenCalledWith(MOCK_ISSUE_ID);
            expect(result._id).toBe(MOCK_ISSUE_ID);
        });

        it('TC-U-06 | should throw AppError 404 when issue is not found', async () => {
            Issue.findById.mockResolvedValue(null);

            await expect(IssueService.getIssueById('nonexistent-id'))
                .rejects
                .toThrow(AppError);

            await expect(IssueService.getIssueById('nonexistent-id'))
                .rejects
                .toMatchObject({ statusCode: 404, message: 'Issue not found' });
        });
    });

    // ── 3. updateIssue ─────────────────────────────────────────────────────
    describe('updateIssue()', () => {

        it('TC-U-07 | should update title and description when reporter edits a Pending issue', async () => {
            const mockIssue = createMockIssue();
            Issue.findById.mockResolvedValue(mockIssue);

            const updateData = { title: 'Updated Title', description: 'Updated desc' };
            await IssueService.updateIssue(MOCK_ISSUE_ID, MOCK_USER_ID, updateData);

            expect(mockIssue.title).toBe('Updated Title');
            expect(mockIssue.description).toBe('Updated desc');
            expect(mockIssue.save).toHaveBeenCalled();
        });

        it('TC-U-08 | should throw 403 if non-reporter tries to update', async () => {
            const mockIssue = createMockIssue({ reporter: 'some-other-user' });
            Issue.findById.mockResolvedValue(mockIssue);

            await expect(
                IssueService.updateIssue(MOCK_ISSUE_ID, MOCK_USER_ID, { title: 'Hack' })
            ).rejects.toMatchObject({ statusCode: 403 });
        });

        it('TC-U-09 | should throw 400 if issue is not in Pending status', async () => {
            const mockIssue = createMockIssue({ status: ISSUE_STATUS.IN_PROGRESS });
            Issue.findById.mockResolvedValue(mockIssue);

            await expect(
                IssueService.updateIssue(MOCK_ISSUE_ID, MOCK_USER_ID, { title: 'Cannot Update' })
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it('TC-U-10 | should throw 404 if issue does not exist', async () => {
            Issue.findById.mockResolvedValue(null);

            await expect(
                IssueService.updateIssue('bad-id', MOCK_USER_ID, {})
            ).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    // ── 4. updateIssueStatus ───────────────────────────────────────────────
    describe('updateIssueStatus()', () => {

        it('TC-U-11 | should transition from Pending → In Progress (admin)', async () => {
            const mockIssue = createMockIssue();
            Issue.findById.mockResolvedValue(mockIssue);

            const result = await IssueService.updateIssueStatus(
                MOCK_ISSUE_ID, ISSUE_STATUS.IN_PROGRESS, MOCK_ADMIN_ID, 'admin', 'Starting work'
            );

            expect(mockIssue.status).toBe(ISSUE_STATUS.IN_PROGRESS);
            expect(mockIssue.statusHistory).toHaveLength(2);
            expect(mockIssue.save).toHaveBeenCalled();
        });

        it('TC-U-12 | should transition from In Progress → Resolved (official)', async () => {
            const mockIssue = createMockIssue({ status: ISSUE_STATUS.IN_PROGRESS });
            Issue.findById.mockResolvedValue(mockIssue);

            await IssueService.updateIssueStatus(
                MOCK_ISSUE_ID, ISSUE_STATUS.RESOLVED, MOCK_ADMIN_ID, 'official', 'Fixed!'
            );

            expect(mockIssue.status).toBe(ISSUE_STATUS.RESOLVED);
        });

        it('TC-U-13 | should throw 403 if citizen tries to resolve an issue', async () => {
            const mockIssue = createMockIssue({ status: ISSUE_STATUS.IN_PROGRESS });
            Issue.findById.mockResolvedValue(mockIssue);

            await expect(
                IssueService.updateIssueStatus(
                    MOCK_ISSUE_ID, ISSUE_STATUS.RESOLVED, MOCK_USER_ID, 'citizen', ''
                )
            ).rejects.toMatchObject({ statusCode: 403 });
        });

        it('TC-U-14 | should throw 400 for invalid transition (Resolved → In Progress)', async () => {
            const mockIssue = createMockIssue({ status: ISSUE_STATUS.RESOLVED });
            Issue.findById.mockResolvedValue(mockIssue);

            await expect(
                IssueService.updateIssueStatus(
                    MOCK_ISSUE_ID, ISSUE_STATUS.IN_PROGRESS, MOCK_ADMIN_ID, 'admin', ''
                )
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it('TC-U-15 | should throw 400 for invalid transition (Withdrawn → Resolved)', async () => {
            const mockIssue = createMockIssue({ status: ISSUE_STATUS.WITHDRAWN });
            Issue.findById.mockResolvedValue(mockIssue);

            await expect(
                IssueService.updateIssueStatus(
                    MOCK_ISSUE_ID, ISSUE_STATUS.RESOLVED, MOCK_ADMIN_ID, 'admin', ''
                )
            ).rejects.toMatchObject({ statusCode: 400 });
        });
    });

    // ── 5. withdrawIssue ───────────────────────────────────────────────────
    describe('withdrawIssue()', () => {

        it('TC-U-16 | should allow reporter to withdraw a Pending issue', async () => {
            const mockIssue = createMockIssue();
            Issue.findById.mockResolvedValue(mockIssue);

            const result = await IssueService.withdrawIssue(MOCK_ISSUE_ID, MOCK_USER_ID);

            expect(mockIssue.status).toBe(ISSUE_STATUS.WITHDRAWN);
            expect(mockIssue.save).toHaveBeenCalled();
        });

        it('TC-U-17 | should throw 403 if non-reporter tries to withdraw', async () => {
            const mockIssue = createMockIssue({ reporter: 'different-user' });
            Issue.findById.mockResolvedValue(mockIssue);

            await expect(
                IssueService.withdrawIssue(MOCK_ISSUE_ID, MOCK_USER_ID)
            ).rejects.toMatchObject({ statusCode: 403 });
        });

        it('TC-U-18 | should throw 400 if issue is already Resolved (cannot withdraw)', async () => {
            const mockIssue = createMockIssue({ status: ISSUE_STATUS.RESOLVED });
            Issue.findById.mockResolvedValue(mockIssue);

            await expect(
                IssueService.withdrawIssue(MOCK_ISSUE_ID, MOCK_USER_ID)
            ).rejects.toMatchObject({ statusCode: 400 });
        });
    });

    // ── 6. addComment ──────────────────────────────────────────────────────
    describe('addComment()', () => {

        it('TC-U-19 | should append a comment to the issue', async () => {
            const mockIssue = createMockIssue();
            Issue.findById.mockResolvedValue(mockIssue);

            const result = await IssueService.addComment(MOCK_ISSUE_ID, MOCK_ADMIN_ID, 'Working on this now.');

            expect(mockIssue.comments).toHaveLength(1);
            expect(mockIssue.comments[0].text).toBe('Working on this now.');
            expect(mockIssue.save).toHaveBeenCalled();
        });

        it('TC-U-20 | should throw 404 if issue does not exist when adding comment', async () => {
            Issue.findById.mockResolvedValue(null);

            await expect(
                IssueService.addComment('bad-id', MOCK_ADMIN_ID, 'text')
            ).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    // ── 7. deleteIssue ─────────────────────────────────────────────────────
    describe('deleteIssue()', () => {

        it('TC-U-21 | should allow reporter to delete their own issue', async () => {
            const mockIssue = createMockIssue();
            Issue.findById.mockResolvedValue(mockIssue);
            Issue.findByIdAndDelete.mockResolvedValue(mockIssue);

            await IssueService.deleteIssue(MOCK_ISSUE_ID, MOCK_USER_ID, 'citizen');

            expect(Issue.findByIdAndDelete).toHaveBeenCalledWith(MOCK_ISSUE_ID);
        });

        it('TC-U-22 | should allow admin to delete any issue', async () => {
            const mockIssue = createMockIssue({ reporter: 'some-other-reporter' });
            Issue.findById.mockResolvedValue(mockIssue);
            Issue.findByIdAndDelete.mockResolvedValue(mockIssue);

            await IssueService.deleteIssue(MOCK_ISSUE_ID, MOCK_ADMIN_ID, 'admin');

            expect(Issue.findByIdAndDelete).toHaveBeenCalledWith(MOCK_ISSUE_ID);
        });

        it('TC-U-23 | should throw 403 if non-reporter/non-admin tries to delete', async () => {
            const mockIssue = createMockIssue({ reporter: 'different-user' });
            Issue.findById.mockResolvedValue(mockIssue);

            await expect(
                IssueService.deleteIssue(MOCK_ISSUE_ID, MOCK_USER_ID, 'citizen')
            ).rejects.toMatchObject({ statusCode: 403 });
        });

        it('TC-U-24 | should clean up Cloudinary images on deletion', async () => {
            const mockIssue = createMockIssue({
                images: [
                    { url: 'https://cdn.test/img1.jpg', publicId: 'civic/img1' },
                    { url: 'https://cdn.test/img2.jpg', publicId: 'civic/img2' },
                ],
            });
            Issue.findById.mockResolvedValue(mockIssue);
            Issue.findByIdAndDelete.mockResolvedValue(mockIssue);

            await IssueService.deleteIssue(MOCK_ISSUE_ID, MOCK_USER_ID, 'citizen');

            expect(CloudinaryService.deleteImages).toHaveBeenCalledWith(['civic/img1', 'civic/img2']);
        });

        it('TC-U-25 | should throw 404 if issue does not exist', async () => {
            Issue.findById.mockResolvedValue(null);

            await expect(
                IssueService.deleteIssue('bad-id', MOCK_USER_ID, 'citizen')
            ).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    // ── 8. getUserIssues ───────────────────────────────────────────────────
    describe('getUserIssues()', () => {

        it('TC-U-26 | should call paginate with reporter filter', async () => {
            Issue.paginate.mockResolvedValue({ docs: [], totalDocs: 0 });

            await IssueService.getUserIssues(MOCK_USER_ID, {});

            expect(Issue.paginate).toHaveBeenCalledWith(
                expect.objectContaining({ reporter: MOCK_USER_ID }),
                expect.any(Object)
            );
        });

        it('TC-U-27 | should apply status filter when provided', async () => {
            Issue.paginate.mockResolvedValue({ docs: [], totalDocs: 0 });

            await IssueService.getUserIssues(MOCK_USER_ID, { status: 'Pending' });

            expect(Issue.paginate).toHaveBeenCalledWith(
                expect.objectContaining({ reporter: MOCK_USER_ID, status: 'Pending' }),
                expect.any(Object)
            );
        });

        it('TC-U-28 | should apply search regex filter in getUserIssues', async () => {
            Issue.paginate.mockResolvedValue({ docs: [], totalDocs: 0 });

            await IssueService.getUserIssues(MOCK_USER_ID, { search: 'pothole' });

            const filterArg = Issue.paginate.mock.calls[0][0];
            expect(filterArg.$or).toBeDefined();
        });
    });

    // ── 9. getPublicIssues ─────────────────────────────────────────────────
    describe('getPublicIssues()', () => {

        it('TC-U-29 | should exclude Withdrawn issues by default', async () => {
            Issue.paginate.mockResolvedValue({ docs: [], totalDocs: 0 });

            await IssueService.getPublicIssues({});

            const filterArg = Issue.paginate.mock.calls[0][0];
            expect(filterArg.status).toEqual({ $ne: ISSUE_STATUS.WITHDRAWN });
        });

        it('TC-U-30 | should apply geo filter when lat/lng are provided', async () => {
            Issue.paginate.mockResolvedValue({ docs: [], totalDocs: 0 });

            await IssueService.getPublicIssues({ latitude: '6.9271', longitude: '80.2707' });

            const filterArg = Issue.paginate.mock.calls[0][0];
            expect(filterArg.location).toBeDefined();
            expect(filterArg.location.$near).toBeDefined();
        });

        it('TC-U-31 | should apply search regex filter in getPublicIssues', async () => {
            Issue.paginate.mockResolvedValue({ docs: [], totalDocs: 0 });

            await IssueService.getPublicIssues({ search: 'water' });

            const filterArg = Issue.paginate.mock.calls[0][0];
            expect(filterArg.$or).toBeDefined();
        });
    });

    // ── 10. AppError Utility ───────────────────────────────────────────────
    describe('AppError utility', () => {

        it('TC-U-32 | should set statusCode and status correctly for 4xx errors', () => {
            const err = new AppError('Not found', 404);
            expect(err.statusCode).toBe(404);
            expect(err.status).toBe('fail');
            expect(err.isOperational).toBe(true);
        });

        it('TC-U-33 | should set status="error" for 5xx errors', () => {
            const err = new AppError('Server error', 500);
            expect(err.statusCode).toBe(500);
            expect(err.status).toBe('error');
        });
    });
});
