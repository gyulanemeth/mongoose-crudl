import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'

import { updateOne } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, required: true },
  refId: { type: mongoose.Types.ObjectId, required: false }
}, { timestamps: true }))

describe('updateOne', () => {
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

    await expect(updateOne(TestModel, { id: test._id }, { name: 'test2' }))
      .rejects
      .toThrow(new Error(`Test with {"_id":"${test._id.toString()}"} is not found.`))
  })

  test('Error: Not found by params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test' })
    await test.save()

    await expect(updateOne(TestModel, { refId, id: test._id }, { name: 'test2' }))
      .rejects
      .toThrow(new Error(`Test with {"_id":"${test._id.toString()}","refId":"${refId}"} is not found.`))
  })

  test('Error: Mongoose Validation', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ refId, name: 'test' })
    await test.save()

    await expect(updateOne(TestModel, { refId, id: test._id }, { name2: 'test2' }))
      .rejects
      .toThrow(new Error('Test validation failed: name: Path `name` is required.'))
  })

  test('Success by id', async () => {
    const test = new TestModel({ name: 'test' })
    await test.save()

    const res = await updateOne(TestModel, { id: test._id }, { name: 'renamed' })

    expect(res.result.name).toBe('renamed')

    const entry = await TestModel.findById(test._id)

    expect(entry.name).toBe('renamed')
  })

  test('Success by params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test', refId })
    await test.save()

    const res = await updateOne(TestModel, { refId, id: test._id }, { name: 'renamed' })

    expect(res.result.name).toBe('renamed')

    const entry = await TestModel.findById(test._id)

    expect(entry.name).toBe('renamed')
  })
})
