const test = require("ava").test;
const chai = require("chai");
const sinon = require("sinon");
const { MongoMemoryServer } = require('mongodb-memory-server');
const startDB = require('../helpers/DB');
const { addUser, getUsers, getSingleUser, deleteUser } = require('../index');
const User = require('../models/user');
const utils = require('../helpers/utils');

const expect = chai.expect;


test.before(async (t) => {
    t.context.mongod = await MongoMemoryServer.create();
    process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
    await startDB();
});

test.after.always(async (t) => {
    await t.context.mongod.stop();
});

// Test case for addUser function
test("create user successfully", async (t) => {
    const request = {
        body: {
            firstName: "Menna",
            lastName: "Hamdy",
            age:11,
            job: "fs",
        },
    };
    const expectedResult = {
        fullName: "Menna Hamdy",
        age: 21,
        job: "fs",
    };
    sinon.stub(utils, 'getFullName').callsFake((fname, lname) => {
        expect(fname).to.be.equal(request.body.firstName);
        expect(lname).to.be.equal(request.body.lastName);
        return 'Menna Hamdy';
    });
    const actualResult = await addUser(request);
    const result = {
        ...expectedResult,
        __v: actualResult.__v,
        _id: actualResult._id
    };
    expect(actualResult).to.be.a('object');
    expect(actualResult._doc).to.deep.equal(result);
});

// Test case for getUsers function
test("get all users successfully", async (t) => {
 
    const userData = [
        { firstName: 'Nada', lastName: 'Walid', age: 17, job: 'student' },
        { firstName: 'Mohamed', lastName: 'Walid', age: 18, job: 'student' }
    ];
    await User.insertMany(userData);

    const users = await getUsers();

    expect(users).to.be.an('array');
    expect(users.length).to.equal(userData.length);
    userData.forEach((expectedUser, index) => {
        expect(users[index].firstName).to.equal(expectedUser.firstName);
        expect(users[index].lastName).to.equal(expectedUser.lastName);
        expect(users[index].age).to.equal(expectedUser.age);
        expect(users[index].job).to.equal(expectedUser.job);
    });
});

// Test case for getSingleUser function
test("get single user successfully", async (t) => {

    const userData = { firstName: 'Nada', lastName: 'Walid', age: 17, job: 'student' };
    const newUser = await User.create(userData);

    const user = await getSingleUser(newUser._id);

    expect(user).to.be.an('object');
    expect(user.firstName).to.equal(userData.firstName);
    expect(user.lastName).to.equal(userData.lastName);
    expect(user.age).to.equal(userData.age);
    expect(user.job).to.equal(userData.job);
});

// Test case for deleteUser function
test("delete user successfully", async (t) => {

    const userData = { firstName: 'Nada', lastName: 'Walid', age: 17, job: 'student' };
    const newUser = await User.create(userData);

    await deleteUser(newUser._id);

    const user = await User.findById(newUser._id);
    expect(user).to.be.null;
});
