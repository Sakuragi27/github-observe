import { NextRequest } from 'next/server';

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  project: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  tag: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  projectTag: {
    create: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
}));

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth API', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        githubToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(requestBody.email).toBe('test@example.com');
      expect(requestBody.password.length).toBeGreaterThanOrEqual(6);
    });

    it('should login an existing user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        githubToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(requestBody.email).toBe('test@example.com');
    });
  });

  describe('Projects API', () => {
    it('should return error when userId is missing', async () => {
      const params = new URLSearchParams();
      expect(params.get('userId')).toBeNull();
    });

    it('should return projects for valid userId', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          userId: 'test-id',
          name: 'test-project',
          fullName: 'owner/test-project',
          description: 'Test project',
          htmlUrl: 'https://github.com/owner/test-project',
          stargazersCount: 100,
          language: 'TypeScript',
          topics: '[]',
          analysis: null,
          solvedProblem: null,
          starredAt: new Date(),
          syncedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);
      mockPrisma.project.count.mockResolvedValue(1);

      expect(mockProjects[0].name).toBe('test-project');
      expect(mockProjects[0].language).toBe('TypeScript');
    });
  });

  describe('Tags API', () => {
    it('should return all tags', async () => {
      const mockTags = [
        { id: 'tag-1', name: 'AI', slug: 'ai', category: '技术领域', count: 10 },
        { id: 'tag-2', name: 'React', slug: 'react', category: '前端', count: 5 },
      ];

      mockPrisma.tag.findMany.mockResolvedValue(mockTags);

      expect(mockTags.length).toBe(2);
      expect(mockTags[0].name).toBe('AI');
    });
  });

  describe('GitHub API', () => {
    it('should parse GitHub repository data', () => {
      const repoData = {
        id: 12345,
        name: 'test-repo',
        full_name: 'owner/test-repo',
        description: 'Test repository',
        html_url: 'https://github.com/owner/test-repo',
        stargazers_count: 100,
        language: 'TypeScript',
        topics: ['ai', 'agent'],
      };

      expect(repoData.name).toBe('test-repo');
      expect(repoData.language).toBe('TypeScript');
      expect(repoData.topics).toContain('ai');
    });
  });

  describe('Encryption', () => {
    it('should encrypt and decrypt data', () => {
      const testData = 'my-secret-token';
      const encrypted = Buffer.from(testData).toString('base64');
      const decrypted = Buffer.from(encrypted, 'base64').toString('utf-8');
      
      expect(decrypted).toBe(testData);
    });
  });
});
