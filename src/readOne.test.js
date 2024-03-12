import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest'
import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'
import { NotFoundError } from 'standard-api-errors'

import { readOne } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, required: true },
  refId: { type: mongoose.Types.ObjectId, required: false }
}, { timestamps: true }))

describe('readOne', () => {
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

    await expect(readOne(TestModel, { id: test._id }))
      .rejects
      .toThrow(new NotFoundError(`Test with {"_id":"${test._id.toString()}"} is not found.`))
  })

  test('Error: Not found by params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test' })
    await test.save()

    await expect(readOne(TestModel, { refId, id: test._id }))
      .rejects
      .toThrow(new NotFoundError(`Test with {"_id":"${test._id.toString()}","refId":"${refId}"} is not found.`))
  })

  test('Success by id', async () => {
    const test = new TestModel({ name: 'test' })
    await test.save()

    const res = await readOne(TestModel, { id: test._id })

    expect(res).toEqual({
      status: 200,
      result: {
        __v: 0,
        _id: test._id,
        name: test.name,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      }
    })
  })

  test('Success by params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test', refId })
    await test.save()

    const res = await readOne(TestModel, { refId, id: test._id })

    expect(res).toEqual({
      status: 200,
      result: {
        __v: 0,
        _id: test._id,
        refId: refId,
        name: test.name,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      }
    })
  })

  test('Success by params with select', async () => {
    const refId = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test', refId })
    await test.save()

    const res = await readOne(TestModel, { refId, id: test._id }, { select: { updatedAt: 1 } })

    expect(res).toEqual({
      status: 200,
      result: {
        _id: test._id,
        updatedAt: test.updatedAt
      }
    })
  })
})
