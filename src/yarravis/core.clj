(ns yarravis.core
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [ring.util.response :as resp]
            [cheshire.core :as cheshire]
            [clojure.data.csv :as csv]
            [clojure.java.io :as io]
            [ring.middleware.json :as json]))

(defn csv-to-maps [data]
  (let [headers (first data)
        rows (rest data)]
    (map #(zipmap headers %) rows)))

(defn bubbledata []
  (with-open [in-file (io/reader "static/data/scatter-data.csv")]
    (doall (csv-to-maps
            (csv/read-csv in-file)))))

(defn yarradata []
  [
   {:id 0
    :location "Mouth"
    }
   {:id 1
    :location "Docklands"
    }
   {:id 3
    :location "Southgate"
    }
   {:id 4
    :location "South Yarra"
    }
   {:id 5
    :location "Abbotsford"
    }
   {:id 6
    :location "Kew"
    }
   {:id 7
    :location "Heidelberg"
    }
   {:id 8
    :location "Templestowe"
    }
   {:id 9
    :location "Warrandyte"
    }
   {:id 10
    :location "Coldstream"
    }
   {:id 11
    :location "Healesville"
    }
   {:id 12
    :location "Launching Place"
    }
   {:id 13
    :location "Millgrove"
    }
   ])

(defroutes app-routes
  (GET "/" [] (resp/file-response "index.html" {:root "static"}))
  (GET "/bubble.json" [] (bubbledata))
  (GET "/yarra.json" [] (yarradata))
  (route/files "/" {:root "static"})
  (route/not-found "<h1>Page not found</h1>"))

(def app
  (-> (handler/api app-routes)
      (json/wrap-json-body {:keywords? true})
      (json/wrap-json-params)
      (json/wrap-json-response)))


