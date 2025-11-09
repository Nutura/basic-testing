import {
  getBankAccount,
  InsufficientFundsError,
  TransferFailedError,
  SynchronizationFailedError,
} from './index';
import { random } from 'lodash';

jest.mock('lodash', () => ({
  random: jest.fn(),
}));

describe('BankAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create account with initial balance', () => {
    const initialBalance = 100;
    const account = getBankAccount(initialBalance);
    expect(account.getBalance()).toBe(initialBalance);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    const account = getBankAccount(100);
    expect(() => account.withdraw(150)).toThrow(InsufficientFundsError);
    expect(() => account.withdraw(150)).toThrow(
      'Insufficient funds: cannot withdraw more than 100',
    );
  });

  test('should throw error when transferring more than balance', () => {
    const account1 = getBankAccount(100);
    const account2 = getBankAccount(50);
    expect(() => account1.transfer(150, account2)).toThrow(
      InsufficientFundsError,
    );
  });

  test('should throw error when transferring to the same account', () => {
    const account = getBankAccount(100);
    expect(() => account.transfer(50, account)).toThrow(TransferFailedError);
    expect(() => account.transfer(50, account)).toThrow('Transfer failed');
  });

  test('should deposit money', () => {
    const account = getBankAccount(100);
    account.deposit(50);
    expect(account.getBalance()).toBe(150);
  });

  test('should withdraw money', () => {
    const account = getBankAccount(100);
    account.withdraw(30);
    expect(account.getBalance()).toBe(70);
  });

  test('should transfer money', () => {
    const account1 = getBankAccount(100);
    const account2 = getBankAccount(50);
    account1.transfer(30, account2);
    expect(account1.getBalance()).toBe(70);
    expect(account2.getBalance()).toBe(80);
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    (random as jest.Mock)
      .mockReturnValueOnce(50) // balance
      .mockReturnValueOnce(1); // requestFailed = false (1 means not failed)

    const account = getBankAccount(100);
    const result = await account.fetchBalance();

    expect(result).toBe(50);
    expect(typeof result).toBe('number');
  });

  test('should set new balance if fetchBalance returned number', async () => {
    (random as jest.Mock)
      .mockReturnValueOnce(75) // balance
      .mockReturnValueOnce(1); // requestFailed = false

    const account = getBankAccount(100);
    await account.synchronizeBalance();

    expect(account.getBalance()).toBe(75);
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    (random as jest.Mock)
      .mockReturnValueOnce(50) // balance
      .mockReturnValueOnce(0); // requestFailed = true (0 means failed)

    const account = getBankAccount(100);

    await expect(account.synchronizeBalance()).rejects.toThrow(
      SynchronizationFailedError,
    );
  });
});
