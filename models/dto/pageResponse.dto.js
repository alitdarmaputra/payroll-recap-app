const responsePagination = (data, page, perPage) => {
	return {
		totalData: data.count,
		totalPages: Math.ceil(data.count/perPage),
		content: data.rows,
		currentPage: isNaN(page)? 1 : page
	}
}

module.exports = responsePagination;
