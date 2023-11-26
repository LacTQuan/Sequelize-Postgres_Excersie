const controller = {};
const models = require('../models');
const sequelize = require('sequelize');

controller.showList = async (req, res) => {
    const page = isNaN(req.query.page)? 1 : parseInt(req.query.page);
    const pageSize = 4;
    const category = req.query.category;
    const searchKey = req.query.search;
    let tag = req.query.tag;

    const query = {
        attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
        include: [
            { model: models.Comment },
            { model: models.Tag },
        ],
    }
    if (category !== undefined && category !== 'All' && category !== '') {
        query.include.push({ model: models.Category, where: { name: category } });
    }

    if (searchKey !== undefined && searchKey !== '') {
        query.where = { title: { [sequelize.Op.iLike]: '%' + searchKey + '%' } };
    }

    if (tag !== undefined && tag !== '') {
        query.include.push({ model: models.Tag, where: { name: tag } });
    }

    const totalItems = await models.Blog.findAll(query);
    res.locals.totalPages = Math.ceil(totalItems.length / pageSize);
    res.locals.currentPage = page;

    query.limit = pageSize;
    query.offset = (page - 1) * pageSize;

    res.locals.blogs = await models.Blog.findAll(query);
    // console.log(res.locals.blogs[0].Tags[0].name);

    res.locals.categories = await models.Category.findAll({
        attributes: ['id', 'name', [sequelize.fn('COUNT', sequelize.col('Blogs.id')), 'blogCount']],
        include: [
          {
            model: models.Blog,
            attributes: [],
          },
        ],
        group: ['Category.id'],
        raw: true,
        order: [['name', 'ASC']],
        });


    res.locals.tags = await models.Tag.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']],
    });
      

    res.render('index');
}

controller.showDetails = async (req, res) => {
    let id = isNaN(req.params.id)? 0 : parseInt(req.params.id);
    res.locals.blog = await models.Blog.findOne({
        attributes: ['id', 'title', 'description', 'createdAt', 'imagePath'],
        where: { id: id },
        include: [
            { model: models.Category },
            { model: models.User },
            { model: models.Tag },
            { model: models.Comment},
        ]
    })
    console.log(res.locals.blog);
    res.render('details');
}

module.exports = controller;
