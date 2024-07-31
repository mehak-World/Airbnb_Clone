module.exports = (fn) => {
    return (req, res, err) => {
        fn(req, res).catch(err);
    }
}