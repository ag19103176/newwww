const express = require("express");
const axios = require("axios");
const router = express.Router();
const mongoose = require("mongoose");
const CommonSchema = require("../models/commonSchema");
const Customer = require("../models/customerModel");
const customerData = require("../src/data1/customer.json");
const Invoice = require("../models/invoiceModel");
const invoiceData = require("../src/data1/invoice.json");
const db = require("../db");
const Joi = require("joi");
const { layouts } = require("chart.js");
const schemas = {
  customers: Customer,
  commonschemas: CommonSchema,
};

router.get("/createCustomerTable", async (req, res) => {
  try {
    await Customer.createCollection();
    console.log("Collection created successfully");
    res.status(200).send("Collection created successfully");
  } catch (err) {
    console.error("Error creating collection: ", err.message);
    res.status(500).send("Error creating collection");
  }
});
router.get("/createInvoiceTable", async (req, res) => {
  try {
    await Invoice.createCollection();
    console.log("Collection created successfully");
    res.status(200).send("Collection created successfully");
  } catch (err) {
    console.error("Error creating collection: ", err.message);
    res.status(500).send("Error creating collection");
  }
});

router.post("/insertCustomerTable", async (req, res) => {
  try {
    await Customer.insertMany(customerData);
    console.log("Records inserted successfully");
    res.status(200).send("Records inserted successfully");
  } catch (err) {
    console.error("Error inserting records: ", err.message);
    res.status(500).send("Error inserting records");
  }
});
router.get("/measure", async (req, res) => {
  try {
    const { chartSource, field2 } = req.query;

    if (!chartSource || !field2) {
      return res.status(400).send("Table name and field1 are required.");
    }
    const response = await schemas[chartSource].aggregate([
      {
        $group: {
          _id: "null",
          totalSum: { $sum: { $toDouble: `$${field2}` } },
        },
      },
    ]);
    res.send({
      status: 200,
      msg: "Sum computed successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error computing sum: ", err.message);
    res.status(500).send("Error computing sum");
  }
});
router.post("/insertInvoiceTable", async (req, res) => {
  try {
    await Invoice.insertMany(invoiceData);
    console.log("Records inserted successfully");
    res.status(200).send("Records inserted successfully");
  } catch (err) {
    console.error("Error inserting records: ", err.message);
    res.status(500).send("Error inserting records");
  }
});

router.get("/getAllData", async (req, res) => {
  const { chartSource } = req.query;
  console.log("Table name:", chartSource);
  try {
    if (!chartSource || !schemas[chartSource]) {
      console.error("Invalid table name:", chartSource);
      return res.status(400).send("Invalid table name");
    }
    const data = await schemas[chartSource].find();
    res.send(data);
  } catch (err) {
    console.error("Error fetching data:", err.message);
    res.status(500).send("Error fetching data");
  }
});

router.get("/getGroup", async (req, res) => {
  try {
    const { chartSource, field1, field2 } = req.query;

    if (!chartSource || !field1 || !field2) {
      return res.status(400).send("Table name and fields are required.");
    }
    const response = await schemas[chartSource].aggregate([
      { $group: { _id: `$${field1}`, value: { $sum: 1 } } },
      { $project: { _id: 0, label: `$_id`, value: 1 } },
    ]);
    console.log(response);

    res.send({
      status: 200,
      msg: "Request processed successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error fetching data: ", err.message);
    res.status(500).send("Error fetching data");
  }
});

const saveSchema = Joi.object({
  companyId: Joi.string(),
  userId: Joi.string(),
  isDeleted: Joi.boolean(),
  chartSource: Joi.string().required(),
  chartBasic: Joi.number().required(),
  chartType: Joi.string(),
  chartNum: Joi.alternatives().conditional("chartBasic", {
    is: "1",
    then: Joi.string().allow(""),
    otherwise: Joi.string().allow(""),
  }),
  getSum: Joi.number(),
  field1: Joi.string().required(),
  field2: Joi.string(),
  layout: Joi.array(),
  // .items(
  //   Joi.object({
  //     x: Joi.number().optional().allow(),
  //     y: Joi.number().optional().allow(),
  //     w: Joi.number().optional().allow(),
  //     h: Joi.number().optional().allow(),
  //   })
  // )
  chartElements: Joi.object({
    pieChart: Joi.object({
      legend: Joi.boolean(),
      total: Joi.boolean(),
      selectPercentage: Joi.string().allow(""),
      minSlicePercentage: Joi.number()
        .allow(null)
        .empty("")
        .default(null)
        .min(0)
        .max(100),
    }),
    barLineChart: Joi.object({
      goalLine: Joi.boolean().allow(),
      goalValue: Joi.number().allow(null).empty("").default(null),
      // goalLabel: Joi.string().allow("").optional(),
      showValues: Joi.boolean().default(false),
      valueToShow: Joi.string().allow(""),
      showLabel: Joi.boolean().default(false),
      showLineAndMarks: Joi.string().allow(""),
      // LabelDisplayMode: Joi.optional(),
      yShowLabel: Joi.boolean().default(null),
      // yLabel: Joi.string().allow("").optional(),
      yshowLineAndMarks: Joi.string().allow(""),
    }),
  }),
});
router.post("/saveGraph", async (req, res) => {
  const {
    companyId,
    userId,
    isDeleted,
    chartSource,
    chartBasic,
    chartType,
    chartNum,
    layout,
    chartElements,
  } = req.body;

  try {
    const newEntry = new CommonSchema({
      graph: [
        {
          companyId,
          userId,
          isDeleted,
          chartSource,
          chartBasic,
          chartType,
          chartNum,
          layout,
          chartElements,
        },
      ],
    });

    console.log("in save", newEntry);

    await newEntry.save();
    res.send({ msg: "Data saved successfully" });
  } catch (err) {
    console.error("Error in saving graph data: ", err.message);
    res.status(500).send("Error in saving graph data");
  }
});

router.patch("/updateGraphPositions/:_id", async (req, res) => {
  try {
    const objid = req.params._id;
    const updatedGraphs = req.body;
    const graphObject = await CommonSchema.findOne({ _id: objid });
    if (!graphObject) {
      return res.status(404).json({ message: "Parent object not found" });
    }
    updatedGraphs.forEach(({ id, x, y, w, h }) => {
      const graphToUpdate = graphObject.graph.find((graph) => graph.id === id);
      if (graphToUpdate) {
        graphToUpdate.layout.x = x;
        graphToUpdate.layout.y = y;
        graphToUpdate.layout.w = w;
        graphToUpdate.layout.h = h;
      }
    });
    const updatedObject = await graphObject.save();

    res.send({
      message: "Graph positions updated successfully",
      updatedObject,
    });
  } catch (err) {
    console.error("Error updating graph positions:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/saveGraph", async (req, res) => {
  try {
    // const validatedData = await saveSchema
    //   .validateAsync(req.body)
    //   .catch((error) => {
    //     throw new Error(
    //       error.details
    //         ? error.details.map((err) => err.message).join(", ")
    //         : error.message
    //     );
    //   });
    // console.log("Validation successful:", validatedData);

    const data = req.body;
    const latestGraph = await CommonSchema.findOne({});
    if (!latestGraph) {
      throw new Error("No graph found in the database");
    }
    const { _id } = latestGraph;
    const graph = [...latestGraph.graph, data];

    const response = await CommonSchema.findByIdAndUpdate(_id, { graph });
    res.send({ response });
  } catch (err) {
    console.error("Error in saving graph data:", err.message);
    res.status(400).send({
      error: err.message,
    });
  }
});

// router.patch("/saveGraph", async (req, res) => {
//   try {
//     // const validatedData = await saveSchema.validateAsync(req.body);
//     // console.log("Validation successful:", validatedData);
//     const data = req.body;
//     const latestGraph = await CommonSchema.findOne({});
//     const { _id } = latestGraph;
//     const graph = [...latestGraph.graph, data];
//     const response = await CommonSchema.findByIdAndUpdate(_id, {
//       graph,
//     });
//     res.send({ response });
//   } catch (err) {
//     console.error("Error in saving graph data:", err.message);
//     res.status(400).send({
//       error: err.details ? err.details.map((err) => err.message) : err.message,
//     });
//   }
// });

router.get("/getGraph", async (req, res) => {
  try {
    const data = await CommonSchema.find({});
    res.send(data);
  } catch (err) {
    console.error("Error fetching data from MongoDB: " + err);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/deleteGraph/:id", async (req, res) => {
  try {
    const graphId = req.body;
    const _id = req.params.id;
    const graphs = await CommonSchema.findOne({ _id: _id });
    console.log(graphs);
    let graph = [];
    for (const item of graphs.graph) {
      if (item._id != graphId.id) {
        graph.push(item);
      }
    }
    const response = await CommonSchema.findByIdAndUpdate(_id, { graph });
    res.send(response);
    console.log(graph);
  } catch (err) {
    console.error("Error deleting graph entry:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/updateGraph/:objid/:id", async (req, res) => {
  try {
    const objid = req.params.objid;
    const id = req.params.id;
    let updatedData = req.body;
    const graphs = await CommonSchema.findOne({ objid });
    const graph = [];

    for (const item of graphs.graph) {
      let temp = item._id;
      if (temp != id) {
        graph.push(item);
      } else graph.push(updatedData);
    }
    const response = await CommonSchema.findByIdAndUpdate(objid, { graph });
    res.send(response);
    // console.log(graph);
    if (!response) {
      return res.status(404).json({ message: "Document not found" });
    }
  } catch (err) {
    console.error("Error updating document:", err.message);
    res.status(500).json({ message: "Error updating document" });
  }
});
router.get("/getAvg", async (req, res) => {
  try {
    const { chartSource, field1 } = req.query;
    if (!chartSource || !field1) {
      return res.status(400).send("Table name and fields are required.");
    }
    const response = await schemas[chartSource].aggregate([
      {
        $group: {
          _id: "null",
          totalSum: { $avg: { $toDouble: `$${field1}` } },
        },
      },
    ]);
    // const response = await schemas[chartSource].aggregate(aggregation).exec();
    res.send({
      status: 200,
      msg: "Request processed successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error fetching data: ", err.message);
    res.status(500).send("Error fetching data");
  }
});

router.get("/getSum", async (req, res) => {
  try {
    const { chartSource, field1 } = req.query;

    if (!chartSource || !field1) {
      return res.status(400).send("Table name and field1 are required.");
    }
    const response = await schemas[chartSource].aggregate([
      {
        $group: {
          _id: "null",
          totalSum: { $sum: { $toDouble: `$${field1}` } },
        },
      },
    ]);
    res.send({
      status: 200,
      msg: "Sum computed successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error computing sum: ", err.message);
    res.status(500).send("Error computing sum");
  }
});
router.get("/getConsolidatedGraph", async (req, res) => {
  try {
    const graphResponse = await axios.get("http://localhost:8000/api/getGraph");
    const graphData = graphResponse.data;

    if (graphData.length > 0) {
      for (const dd of graphData[0].graph) {
        if (dd.chartBasic === "1") {
          const response = await axios.get(
            "http://localhost:8000/api/getGroup",
            {
              params: {
                chartSource: dd.chartSource,
                field1:
                  dd.chartType === "1"
                    ? dd.chartElements.pieChart.dimension
                    : dd.chartElements.barLineChart.xaxis,
                field2:
                  dd.chartType === "1"
                    ? dd.chartElements.pieChart.measure
                    : dd.chartElements.barLineChart.yaxis,
              },
            }
          );

          const dataLabel = response.data.data.map((item) => ({
            label: item.label == null ? "nolabel" : item.label,
            value: item.value == null ? "1" : item.value,
          }));
          dd.json_data = dataLabel;
          let x;
          if (dd.chartType === "1" && dd.chartElements.pieChart.total) {
            x = await axios.get(`http://localhost:8000/api/getSum`, {
              params: {
                chartSource: dd.chartSource,
                field1: dd.chartElements.pieChart.measure,
              },
            });
            const res = x.data;
            const totalSum = res.data[0].totalSum;
            dd.chartElements.pieChart.getSum = totalSum;
          }
        } else if (dd.chartBasic === "2") {
          let x;
          if (dd.chartNum === "1") {
            x = await axios.get(`http://localhost:8000/api/getSum`, {
              params: {
                chartSource: dd.chartSource,
                field1: dd.chartElements.sumChart.field,
              },
            });
          } else if (dd.chartNum === "2") {
            x = await axios.get(`http://localhost:8000/api/getAvg`, {
              params: {
                chartSource: dd.chartSource,
                field1: dd.chartElements.sumChart.field,
              },
            });
          }

          const res = x.data;
          const totalSum = res.data[0].totalSum;
          dd.chartElements.sumChart.getSum = totalSum;
        }
      }
    }

    res.json(graphData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// router.get("/getGraph", async (req, res) => {
//   try {
//     const data = await CommonSchema.find({});
//     const filteredData = data.map((doc) => ({
//       _id: doc._id,
//       graph: doc.graph.filter((entry) => !entry.isDeleted),
//     }));
//     // console.log(filteredData);
//     res.send(filteredData);
//   } catch (err) {
//     console.error("Error fetching data from MongoDB: " + err);
//     res.status(500).send("Internal Server Error");
//   }
// });

///soft delete
// router.patch("/deleteGraph/:id", async (req, res) => {
//   try {
//     const graphId = req.body;
//     const _id = req.params.id;
//     const graphs = await CommonSchema.findOne({ _id: _id });
//     // console.log(graphs);
//     let graph = [];
//     for (const item of graphs.graph) {
//       if (item._id == graphId.id) {
//         item.isDeleted = true;
//       }
//       graph.push(item);
//     }
//     const response = await CommonSchema.findByIdAndUpdate(_id, { graph });
//     res.send(response);
//     // console.log(graph);
//   } catch (err) {
//     console.error("Error deleting graph entry:", err);
//     res.status(500).send("Internal Server Error");
//   }
// });

module.exports = router;
