(ns yarravis.core
  (:require [yarravis.data :as data]
            [compojure.core :refer :all]
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
    :distance 0
    :height 0
    }
   {:id 1
    :location "Docklands"
    :distance 3
    :height 3
    }
   {:id 3
    :location "Southgate"
    :distance 5
    :height 5
    }
   {:id 4
    :location "South Yarra"
    :distance 8
    :height 10
    }
   {:id 5
    :location "Abbotsford"
    :distance 10
    :height 25
    }
   {:id 6
    :location "Kew"
    :distance 16
    :height 30
    }
   {:id 7
    :location "Heidelberg"
    :distance 19
    :height 45
    }
   {:id 8
    :location "Templestowe"
    :distance 23
    :height 55
    }
   {:id 9
    :location "Warrandyte"
    :distance 28
    :height 60
    }
   {:id 10
    :location "Coldstream"
    :distance 33
    :height 70
    }
   {:id 11
    :location "Healesville"
    :distance 40
    :height 80
    }
   {:id 12
    :location "Launching Place"
    :distance 43
    :height 95
    }
   {:id 13
    :location "Millgrove"
    :distance 49
    :height 100
    }
   ])

(defn water-optionally-by [timestamp]
  (if timestamp
    (data/water-readings-by (Long/parseLong timestamp))
    (data/water-data)))

(defroutes app-routes
  (GET "/" [] (resp/file-response "index.html" {:root "static"}))
  (GET "/bubble.json" [] (bubbledata))
  (GET "/yarra.json" [] (partition 2 1 (yarradata))) 
  (GET "/water.json" [] (partition 2 1 (data/water-for-json))) 
  (route/files "/" {:root "static"})
  (route/not-found "<h1>Page not found</h1>"))

(def app
  (-> (handler/api app-routes)
      (json/wrap-json-body {:keywords? true})
      (json/wrap-json-params)
      (json/wrap-json-response)))


