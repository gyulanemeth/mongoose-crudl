import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'
import { ValidationError, NotFoundError } from 'standard-api-errors'

import { patchOne } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, required: true },
  anotherParam: { type: String },
  refId: { type: mongoose.Types.ObjectId, required: false }
}, { timestamps: true }))

describe('patchOne', () => {
  beforeAll(async () => {
    await mongooseMemoryServer.start()
    await mongooseMemoryServer.connect('test-db')
  })
  afterEach(async () => {
    await mongooseMemoryServer.purge()
  })
  afterAll(async () => {
    await mongooseMemoryServer.disconnect()
    await mongooseMemoryServer.stop()
  })

  test('Error: Not found by id', async () => {
    const test = new TestModel({ name: 'test' })
    await test.save()

    await TestModel.deleteOne({ _id: test._id })

    await expect(patchOne(TestModel, { id: test._id }, { name: 'test2' }))
      .rejects
      .toThrow(new NotFoundError(`Test with {"_id":"${test._id.toString()}"} is not found.`))
  })

  test('Error: Not found by params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test' })
    await test.save()

    await expect(patchOne(TestModel, { refId, id: test._id }, { name: 'test2' }))
      .rejects
      .toThrow(new NotFoundError(`Test with {"_id":"${test._id.toString()}","refId":"${refId}"} is not found.`))
  })

  test('Error: Mongoose Validation', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ refId, name: 'test' })
    await test.save()

    await expect(patchOne(TestModel, { refId, id: test._id }, { name: null }))
      .rejects
      .toThrow(new ValidationError('Test validation failed: name: Path `name` is required.'))
  })

  test('Success by id', async () => {
    const test = new TestModel({ name: 'test', anotherParam: 'should remain the same' })
    await test.save()

    const res = await patchOne(TestModel, { id: test._id }, { name: 'renamed' })

    expect(res.result.name).toBe('renamed')
    expect(res.result.anotherParam).toBe('should remain the same')

    const entry = await TestModel.findById(test._id)

    expect(entry.name).toBe('renamed')
    expect(entry.anotherParam).toBe('should remain the same')
  })

  test('Success by params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test', anotherParam: 'should remain the same', refId })
    await test.save()

    const res = await patchOne(TestModel, { refId, id: test._id }, { name: 'renamed' })

    expect(res.result.name).toBe('renamed')
    expect(res.result.anotherParam).toBe('should remain the same')

    const entry = await TestModel.findById(test._id)

    expect(entry.name).toBe('renamed')
    expect(entry.anotherParam).toBe('should remain the same')
  })
})
