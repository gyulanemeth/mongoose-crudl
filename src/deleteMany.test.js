import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest'
import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'

import { deleteMany } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, required: true },
  refId: { type: mongoose.Types.ObjectId, required: false }
}, { timestamps: true }))

describe('deleteMany', () => {
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

  test('Success by params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const refId2 = new mongoose.Types.ObjectId()
    const test = new TestModel({ name: 'test', refId })
    await test.save()

    const test2 = new TestModel({ name: 'test2', refId2 })
    await test2.save()

    const test3 = new TestModel({ name: 'test3', refId })
    await test3.save()

    const res = await deleteMany(TestModel, { refId })

    expect(res).toEqual({
      status: 200,
      result: {
        acknowledged: true,
        deletedCount: 2
      }
    })

    const entries = await TestModel.find({})

    expect(entries.length).toBe(1)
    expect(entries[0].name).toBe('test2')
  })
})
