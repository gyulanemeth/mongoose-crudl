import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest'
import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'
import { ValidationError, ConflictError, NotFoundError } from 'standard-api-errors'

import { updateOne } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const Test2Model = mongoose.model('Test2', new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true }))

const TestModel = mongoose.model('TestUpdateOne', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  refId: { type: mongoose.Types.ObjectId, ref: 'Test2', required: false }
}, { timestamps: true }))

describe('updateOne', () => {
  beforeAll(async () => {
    await mongooseMemoryServer.start({ storageEngine: 'wiredTiger' })
    await mongooseMemoryServer.connect('test-db')
  })
  afterEach(async () => {
    await mongooseMemoryServer.purge()
  })
  afterAll(async () => {
    await mongooseMemoryServer.disconnect()
    await mongooseMemoryServer.stop()
  })

  // for some reason, the name index is only working if this test is run first... but it works at the second place in createOne.test.js... weird.
  test('Error: Mongoose Duplicate Key', async () => {
    const test = new TestModel({ name: 'test' })
    await test.save()

    const test2 = new TestModel({ name: 'test 2' })
    await test2.save()

    await expect(updateOne(TestModel, { id: test2._id }, { name: 'test' }))
      .rejects
      .toThrow(new ConflictError('Plan executor error during findAndModify :: caused by :: E11000 duplicate key error collection: test-db.testupdateones index: name_1 dup key: { name: "test" }'))
  })

  test('Error: Not found by id', async () => {
    const test = new TestModel({ name: 'test' })
    await test.save()

    await TestModel.deleteOne({ _id: test._id })

    await expect(updateOne(TestModel, { id: test._id }, { name: 'test2' }))
      .rejects
      .toThrow(new NotFoundError(`TestUpdateOne with {"_id":"${test._id.toString()}"} is not found.`))
  })

  test('Error: Not found by params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test' })
    await test.save()

    await expect(updateOne(TestModel, { refId, id: test._id }, { name: 'test2' }))
      .rejects
      .toThrow(new NotFoundError(`TestUpdateOne with {"_id":"${test._id.toString()}","refId":"${refId}"} is not found.`))
  })

  test('Error: Mongoose Validation', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ refId, name: 'test' })
    await test.save()

    await expect(updateOne(TestModel, { refId, id: test._id }, { name2: 'test2' }))
      .rejects
      .toThrow(new ValidationError('TestUpdateOne validation failed: name: Path `name` is required.'))
  })

  test('Success by id', async () => {
    const test = new TestModel({ name: 'test' })
    await test.save()

    const res = await updateOne(TestModel, { id: test._id }, { name: 'renamed' })

    expect(res.result.name).toBe('renamed')

    const entry = await TestModel.findById(test._id)

    expect(entry.name).toBe('renamed')
  })

  test('Success by populate', async () => {
    const test1 = new Test2Model({ name: 'test2' })
    await test1.save()

    const test = new TestModel({ name: 'test', refId: test1._id })
    await test.save()

    const res = await updateOne(TestModel, { id: test._id }, { name: 'renamed' }, 'refId')

    expect(res.result.name).toBe('renamed')
    expect(res.result.refId.name).toBe('test2')

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
