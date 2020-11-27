const Card = require('../models/card');
const NotFoundError = require("../errors/not-found-err");
const ForbiddenError = require("../errors/forbidden-err");

const getCards = async (req, res, next) => {
  try {
    const data = await Card.find({});
    res.send(data);
  } catch (err) {
    next(err);
  }
  return null;
};

const getCard = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryCard = await Card.findById(id);
    if(!queryCard) {
      throw new NotFoundError('Пользователя не существует');
    } else {
      res.status(200).send(queryCard);
    }
  } catch (err) {
   next(err)
  }
  return null;
};

const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const ownerId = req.user._id;
    const savedCard = await Card.create({ name, link, owner: ownerId });
    res.status(200).send(savedCard);
  } catch (err) {
    next(err);
  }
  return null;
};

const deleteCard = async (req, res, next) => {
  try {
    const user = req.user._id;
    const { id } = req.params;
    const query_card = await Card.findById(id).orFail(new Error('NotFound'));
    const query_cardOwner = JSON.stringify(query_card.owner).slice(1, -1);

   if (user !== query_cardOwner){
      throw new ForbiddenError('Запрещено удалять карточки других пользователей');
    } else {
      const deletedCard = await Card.findByIdAndDelete(id);
      if(!deletedCard) {
        throw new NotFoundError('Карточка с таким id не нвйдена');
      } else {
        res.send(deletedCard);
      }
    }
  } catch (err) {
    next(err);
  }
  return null;
};

const likeCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if(!card) {
      throw new NotFoundError('Карточка с таким id не нвйдена');
    } else {
      res.status(200).send(card);
    }
  } catch (err) {
    next(err);
  }
  return null;
};

const dislikeCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if(!card) {
      throw new NotFoundError('Карточка с таким id не нвйдена');
    } else {
      res.status(200).send(card);
    }
  } catch (err) {
    next(err)
  }
  return null;
};

module.exports = {
  getCards,
  getCard,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
