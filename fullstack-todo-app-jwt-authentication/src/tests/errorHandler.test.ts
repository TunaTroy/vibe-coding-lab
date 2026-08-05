import { errorHandler } from '../middleware/errorHandler';

describe('errorHandler', () => {
  it('returns a JSON response for Error instances', () => {
    const req = {} as any;
    const res = { headersSent: false, status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    errorHandler(new Error('boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
  });

  it('falls through when headers have already been sent', () => {
    const req = {} as any;
    const res = { headersSent: true, status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    errorHandler(new Error('boom'), req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
