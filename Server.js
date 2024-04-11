const express = require('express');
const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
const key = "SHivamkaleisgoodboy";
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '',
    database: 'mydb',
})

const UserDetail = sequelize.define('UserDetail', {
    fullName: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
    },role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
    },
});

sequelize.sync()
    .then(() => {
        console.log('Models synchronized with the database.');
    })
    .catch(err => {
        console.error('Unable to synchronize models with the database:', err);
    });



app.post('/register', async (req, resp) => {
    const { fullName, email, password } = req.body
    try {
        const existingUser = await UserDetail.findOne({ where: { email } });
        if (existingUser) {
            resp.json({ message: "User With Email Already Exist", email });
        }
        else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = await UserDetail.create({ fullName: fullName, email: email, password: hashPassword })
            resp.json({ message: "User Register SuccessFully", user });
        }

    } catch (error) {
        resp.send(error);
    }
})


app.post('/login', async (req, resp) => {
    const { email, password } = req.body;
    try {
        const user = await UserDetail.findOne({ where: { email } });
        if (user) {
            const matchPassword = await bcrypt.compare(password, user.password);
            if (matchPassword) {
                const tokenPlayload = {
                    fullName: user.fullName,
                    email: user.email,
                    id: user.id,
                }
                const token = jwt.sign(tokenPlayload, key, { expiresIn: '3h' });
                const obj = {
                    fullName: user.fullName,
                    email: user.email,
                    id: user.id,
                    token
                }
                resp.json({ message: "User Login SuccessFully", obj });
            } else {
                resp.json({ message: "Invalid Password" })
            }
        } else {
            resp.json({ message: "User With Enter Email not Not Found" });
        }
    } catch (error) {
        resp.json(error);
    }
});

app.put('/updateuser/:id', async (req, resp) => {
    const userId = req.params.id;
    const { fullName, password } = req.body;
    try {

        const isUser = await UserDetail.findByPk(userId);
        if (isUser) {
            const hashPassword = await bcrypt.hash(password, 10);
            const [updateUser] = await UserDetail.update({ fullName: fullName, password: hashPassword }, { where: {id: userId } });
            resp.json({ message: "User Updated SuccessFully" });
        } else {
            resp.json({ message: "User Not Found" });
        }
    } catch (error) {
        resp.json({ error })
    }
})

app.get('/user', async (req, resp) => {
    try {
        const user = await UserDetail.findAll({
            attributes:['id','fullName','email']
        });
        resp.send(user);
    } catch (error) {
        resp.send(error);
    }
})

app.put('/update/:id', async (req, resp) => {
    try {
        const userId = req.params.id;
        const { firstName, lastName } = req.body;
        const updateUser = await UserDetail.update({ firstName: firstName, lastName: lastName }, { where: { id: userId } });
        const obj = {
            message: "User Updated successFully",
            userFirstName: firstName, userLastName: lastName
        }
        resp.json({ message: obj })
    } catch (error) {
        resp.send(error);
    }
})

app.delete('/delete/:id', async (req, resp) => {
    try {
        const userId = req.params.id;
        await UserDetail.destroy({ where: { id: userId } });
        resp.json({ message: 'User Deleted successfully', userId });
    } catch (error) {
        resp.send(error);
    }
})


app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
});