import fs from 'fs/promises'
import create from './create'

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
    mkDir: jest.fn(),
  },
}));

describe('when create is in args', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-08-01T20:35:10.329Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })
  it('creates an sql file in the migrations directory', async () => {
    await create({
      action: 'create',
      pathOrCount: 'hello-world'
    })

    expect(fs.writeFile).toHaveBeenCalledWith('20220801203510-hello-world.ts')
  })
})