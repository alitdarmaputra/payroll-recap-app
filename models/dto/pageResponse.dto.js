class responsePagination {
	constructor(data, page, perPage) {
		this.totalData = data.count,
		this.totalPages = Math.ceil(data.count/perPage),
		this.content = data.rows,
		this.currentPage = isNaN(page)? 1 : page
	}
}

module.exports = responsePagination;
