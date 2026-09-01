import { TestBed } from '@angular/core/testing';
import { AuthSession } from './auth.models';
import { AuthSessionStorage } from './auth-session-storage.service';

const session: AuthSession = {
  accessToken: 'jwt-access-token',
  user: {
    userId: 42,
    fullName: 'Camille Martin',
    email: 'camille@stockflow.fr',
    role: 'ROLE_ADMIN',
  },
};

describe('AuthSessionStorage', () => {
  let service: AuthSessionStorage;

  beforeEach(() => {
    window.sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSessionStorage);
  });

  afterEach(() => window.sessionStorage.clear());

  it('should persist and restore a valid authentication session', () => {
    service.save(session);

    expect(service.read()).toEqual(session);
  });

  it('should clear the persisted session', () => {
    service.save(session);
    service.clear();

    expect(service.read()).toBeNull();
  });

  it('should reject corrupted session data', () => {
    window.sessionStorage.setItem('stockflow.auth.session', '{"accessToken":""}');

    expect(service.read()).toBeNull();
    expect(window.sessionStorage.getItem('stockflow.auth.session')).toBeNull();
  });
});
