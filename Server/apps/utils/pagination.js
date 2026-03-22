const genericPagination = ({ page, limit, total, data }) => {
    try {
        const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
        const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 10;

        return {
            itemCount: total,
            itemsList: data,
            perPage: limitNum,
            currentPage: pageNum,
            pageCount: Math.ceil(total / limitNum),
            hasNext: pageNum * limitNum < total,
            hasPrev: pageNum > 1
        };

    } catch (error) {
        console.log(error);
    }
};

module.exports = genericPagination;