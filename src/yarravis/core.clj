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
    :height 0
    }
   {:id 1
    :location "Docklands"
    :height 3
    }
   {:id 3
    :location "Southgate"
    :height 5
    }
   {:id 4
    :location "South Yarra"
    :height 10
    }
   {:id 5
    :location "Abbotsford"
    :height 25
    }
   {:id 6
    :location "Kew"
    :height 30
    }
   {:id 7
    :location "Heidelberg"
    :height 45
    }
   {:id 8
    :location "Templestowe"
    :height 55
    }
   {:id 9
    :location "Warrandyte"
    :height 60
    }
   {:id 10
    :location "Coldstream"
    :height 70
    }
   {:id 11
    :location "Healesville"
    :height 80
    }
   {:id 12
    :location "Launching Place"
    :height 95
    }
   {:id 13
    :location "Millgrove"
    :height 100
    }
   ])

(defroutes app-routes
  (GET "/" [] (resp/file-response "index.html" {:root "static"}))
  (GET "/bubble.json" [] (bubbledata))
  (GET "/yarra.json" [] (seq  (yarradata)))
  (route/files "/" {:root "static"})
  (route/not-found "<h1>Page not found</h1>"))

(def app
  (-> (handler/api app-routes)
      (json/wrap-json-body {:keywords? true})
      (json/wrap-json-params)
      (json/wrap-json-response)))


