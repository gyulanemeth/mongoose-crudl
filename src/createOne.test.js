import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'
import { ValidationError } from 'standard-api-errors'

import { createOne } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, required: true },
  refId: { type: mongoose.Types.ObjectId, required: false }
}, { timestamps: true }))

describe('createOne', () => {
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

  test('Error: Mongoose Validation', async () => {
    await expect(createOne(TestModel))
      .rejects
      .toThrow(new ValidationError('Test validation failed: name: Path `name` is required.'))
  })

  test('Success', async () => {
    const res = await createOne(TestModel, null, { name: 'test' })

    expect(res.status).toBe(201)
    expect(res.result.name).toBe('test')

    const entry = await TestModel.findById(res.result._id)

    expect(entry.name).toBe(res.result.name)
  })

  test('Success with params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const res = await createOne(TestModel, { refId }, { name: 'test' })

    expect(res.status).toBe(201)
    expect(res.result.refId.toString()).toBe(refId.toString())
    expect(res.result.name).toBe('test')

    const entry = await TestModel.findById(res.result._id)

    expect(entry.refId.toString()).toBe(res.result.refId.toString())
    expect(entry.name).toBe(res.result.name)
  })
})
