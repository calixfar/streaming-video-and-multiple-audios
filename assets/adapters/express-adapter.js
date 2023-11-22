class ExpressAdapter {
  static jsonAdapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      }

      const httpResponse = await router.route(httpRequest)

      res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }

  static streamMediaAdapt (streamMedia) {
    return (req, res) => {
      streamMedia.stream(req, res)
    }
  }

  static staticFileAdapt (staticFile) {
    return (req, res) => {
      staticFile.serve(req, res)
    }
  }
}