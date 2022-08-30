class responsePagination {
	constructor(data, page, size) {
		this.totalData = data.count,
		this.totalPages = Math.ceil(data.count/size),
		this.content = data.rows,
		this.currentPage = isNaN(page)? 1 : page
	}
}

module.exports = responsePagination;
