const express = require('express');
const router = express.Router();
const Post = require('../models/PostModel');
const User = require('../models/UserModel');
const auth = require('../middleware/auth');

// @route 	GET api/posts/feed
// @desc 	  Obtém o feed de um usuário
// @access 	Public
router.get('/feed', auth, async (request, response) => {
  const pageSize = request.query.pageSize ? request.query.pageSize : 10
  const currentPage = request.query.currentPage ? request.query.currentPage : 1
  
  try {
    const following = await User.findById(request.user.id);
    const filterQuery = { user: [...following.following, request.user.id] }
    const itemCount = await Post.countDocuments(filterQuery);
    const result = await Post.find(filterQuery)
      .populate('user', 'username id avatar')
      .sort({ createdAt: 'desc' })
      .limit(parseInt(pageSize))
      .skip(pageSize * currentPage - pageSize)
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

// @route 	GET api/posts/:id
// @desc 	  Obtém as postagens feitas por um usuário
// @access 	Public
router.get('/user/:id', async (request, response) => {
  try {
    const result = await Post.find({ user: request.params.id })
      .populate('user', 'username id avatar')
      .sort({ createdAt: 'desc' });
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

// @route 	POST api/posts
// @desc 	  Publica uma nova postagem em nome do usuário logado
// @access 	Private
router.post('/', auth, async (request, response) => {
  const { content } = request.body;
  try {
    var post = new Post({
      content,
      user: request.user.id
    });
    var result = await post.save();
    result = await result.populate('user', 'username id avatar').execPopulate();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

// @route 	DELETE api/posts/:id
// @desc 	  Publica uma nova postagem em nome do usuário logado
// @access 	Private
router.delete('/:id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (post) {
      if (post.user == request.user.id) {
        post.remove();
        const result = post.save();
        response.send(result);
      } else {
        return response
          .status(400)
          .json({
            errors: [
              { msg: 'Você não tem autorização para excluir esta postagem' }
            ]
          });
      }
    } else {
      return response
        .status(400)
        .json({ errors: [{ msg: 'Essa postagem não existe.' }] });
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

// @route 	PUT api/posts/:id/like
// @desc 	  Curte ou descurte uma postagem
// @access 	Private
router.put('/:id/like', auth, async (request, response) => {
  const { id } = request.params;
  try {
    const post = await Post.findById(id);

    if (post) {
      if (post.likes.includes(request.user.id)) {
        post.likes.pull(request.user.id);
      } else {
        post.likes.push(request.user.id);
      }

      var result = await post.save();
      response.send(result);
    } else {
      return response
        .status(400)
        .json({ errors: [{ msg: 'Essa postagem não existe.' }] });
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

module.exports = router;